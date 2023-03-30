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

const queueNotificationSingle = async (notification: NotificationDocument) => {
  const firestore = getFirestore();
  const { emails } = parseChannels(notification.notifyChannels);

  const batch = firestore.batch();

  if (emails.length > 0) {
    const mailTo = emails.join(',');

    const isAlreadyQueued = await firestore
      .collection(FireCollection.sendNotificationQueue)
      .where('channelType', '==', 'email')
      .where('sourceNotificationId', '==', notification.id)
      .where('data.to', '==', mailTo)
      .where('isSent', '==', true)
      .limit(1)
      .get()
      .then((r) => !!r.docs[0]);

    if (!isAlreadyQueued) {
      batch.create(
        firestore.collection(FireCollection.sendNotificationQueue).doc(),
        buildSendNotificationDocData({
          sourceNotificationId: notification.id,
          channelType: 'email',
          data: {
            to: emails.join(','),
            subject: mailTemplate.birthdaySoon.subject(),
            html: mailTemplate.birthdaySoon.html()
          }
        })
      );
    }
  }

  await batch.commit();
};

async function queueNotificationsIfNeeded() {
  const firestore = getFirestore();

  const notifications = await firestore
    .collection('notification')
    .where('notifyAt', '<=', new Date().toISOString())
    .get()
    .then((r) =>
      r.docs.map((d) => firestoreSnapshotToData<NotificationDocument>(d)!)
    );

  await Promise.all(notifications.map((n) => queueNotificationSingle(n)));

  return notifications;
}

export const queueNotifications = createScheduledFunction(
  'every 15 seconds',
  async () => {
    await queueNotificationsIfNeeded();
  }
);

export const debugQueueNotifications = createDebugHttpFn(async () => {
  return queueNotificationsIfNeeded();
});
