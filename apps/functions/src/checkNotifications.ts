import { getFirestore } from 'firebase-admin/firestore';
import {
  createDebugHttpFn,
  createScheduledFunction
} from './utils/createFunction';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  FireCollection,
  NotificationDocument,
  SendNotificationDocument
} from '@shared/types';
import { mailTemplate } from './email/templates';

const parseChannels = (notifyChannels: string[]) => {
  const emailPrefix = 'email:';
  const emails: string[] = [];

  notifyChannels.forEach((channel) => {
    if (channel.startsWith(emailPrefix)) {
      emails.push(channel.replace(emailPrefix, ''));
    }
  });

  return {
    emails
  };
};

const buildSendNotificationDocData = (
  data: Omit<SendNotificationDocument, 'id' | 'createdAt' | 'isSent'>
): Omit<SendNotificationDocument, 'id'> => ({
  ...data,
  createdAt: new Date().toISOString(),
  isSent: false
});

// todo revise logic with `queuedNotifyChannels`
const notifyUser = async (notification: NotificationDocument) => {
  const firestore = getFirestore();
  const queuedNotifyChannels = { ...(notification.queuedNotifyChannels ?? {}) };

  const { emails } = parseChannels(
    notification.notifyChannels.filter((c) => !queuedNotifyChannels[c])
  );

  const batch = firestore.batch();

  if (emails.length > 0) {
    const queueEmailDoc = firestore
      .collection(FireCollection.sendNotificationQueue)
      .doc();

    batch.create(
      queueEmailDoc,
      buildSendNotificationDocData({
        sourceNotificationId: notification.id,
        channel: 'email',
        data: {
          to: emails,
          subject: mailTemplate.birthdaySoon.subject(),
          html: mailTemplate.birthdaySoon.html()
        }
      })
    );

    emails.forEach((mail) => {
      const channel = notification.notifyChannels.find((c) => c.endsWith(mail));

      if (channel) {
        queuedNotifyChannels[channel] = queueEmailDoc.id;
      }
    });
  }

  const updates: Partial<NotificationDocument> = {
    queuedNotifyChannels
  };

  batch.update(
    firestore.collection(FireCollection.notifications).doc(notification.id),
    updates
  );

  await batch.commit();
};

async function notifyUsersIfNeeded() {
  const firestore = getFirestore();

  const now = new Date().toISOString();

  const notifications = await firestore
    .collection('notification')
    .where('notifyAt', '<=', now)
    .get()
    .then((r) =>
      r.docs.map((d) => firestoreSnapshotToData<NotificationDocument>(d)!)
    );

  await Promise.all(notifications.map((n) => notifyUser(n)));

  return notifications;
}

export const checkNotifications = createScheduledFunction(
  'every 15 seconds',
  async () => {
    await notifyUsersIfNeeded();
  }
);

export const debugCheckNotifications = createDebugHttpFn(async () => {
  return notifyUsersIfNeeded();
});
