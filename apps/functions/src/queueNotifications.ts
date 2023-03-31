import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  createDebugHttpFn,
  createScheduledFunction
} from './utils/createFunction';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  FireCollection,
  NotificationChannelType,
  NotificationDocument,
  SendEmailData,
  SendNotificationDocument,
  SendNotificationDocumentData
} from '@shared/types';
import { mailTemplate } from './email/templates';
import {
  getEmailFromEmailChannel,
  isEmailChannel
} from '@shared/notification-channels';

const buildSendNotificationDocData = (
  data: Omit<SendNotificationDocument, 'id' | 'createdAt' | 'isSent'>
): Omit<SendNotificationDocument, 'id'> => ({
  ...data,
  createdAt: new Date().toISOString(),
  isSent: false
});

const queueNotificationInChannel = async (
  notificationId: string,
  channel: string
) => {
  const firestore = getFirestore();

  let channelType: NotificationChannelType | undefined;
  let data: SendNotificationDocumentData | undefined;

  if (isEmailChannel(channel)) {
    const existingQueueDoc = await firestore
      .collection(FireCollection.sendNotificationQueue)
      .where('sourceNotificationId', '==', notificationId)
      .where('data.to', '==', getEmailFromEmailChannel(channel))
      .limit(1)
      .get()
      .then((r) => (r.size > 0 ? r.docs[0] : null));

    if (existingQueueDoc) return existingQueueDoc;

    channelType = 'email';
    data = {
      to: getEmailFromEmailChannel(channel),
      subject: mailTemplate.birthdaySoon.subject(),
      html: mailTemplate.birthdaySoon.html()
    } as SendEmailData;
  }

  if (!channelType || !data) {
    throw new Error('Unhandled channel type');
  }

  const queueDoc = firestore
    .collection(FireCollection.sendNotificationQueue)
    .doc();

  await queueDoc.set(
    buildSendNotificationDocData({
      sourceNotificationId: notificationId,
      channelType,
      data
    })
  );

  return queueDoc;
};

const processNotification = async (notification: NotificationDocument) => {
  const firestore = getFirestore();

  let queueError: string | undefined;
  let queueDocRef:
    | FirebaseFirestore.QueryDocumentSnapshot
    | FirebaseFirestore.DocumentReference
    | undefined;

  try {
    queueDocRef = await queueNotificationInChannel(
      notification.id,
      notification.notifyChannel
    );
  } catch (err) {
    queueError = err.message ?? err.description ?? 'Unknown error';
  }

  const updateForNotification: Partial<NotificationDocument> = {
    isQueued: !!queueDocRef,
    queueDocId: queueDocRef?.id ?? (FieldValue.delete() as any),
    queueError: queueError ?? (FieldValue.delete() as any)
  };

  await firestore
    .collection(FireCollection.notifications)
    .doc(notification.id)
    .set(updateForNotification, { merge: true });

  return updateForNotification.isQueued;
};

async function checkNotifications() {
  const firestore = getFirestore();

  functions.logger.info('Checking notifications to be sent');

  const notifications = await firestore
    .collection(FireCollection.notifications)
    .where('notifyAt', '<=', new Date().toISOString())
    .where('isQueued', '==', false)
    .get()
    .then((r) =>
      r.docs.map((d) => firestoreSnapshotToData<NotificationDocument>(d)!)
    );

  let totalQueued = 0;

  await Promise.all(
    notifications.map(async (n) => {
      const isQueued = await processNotification(n);

      if (isQueued) {
        totalQueued++;
      }
    })
  );

  functions.logger.info('Notifications processed', {
    totalProcessed: notifications.length,
    totalNotQueued: notifications.length - totalQueued,
    totalQueued
  });

  return notifications;
}

export const queueNotifications = createScheduledFunction(
  'every 15 minutes',
  async () => {
    await checkNotifications();
  }
);

export const debugQueueNotifications = createDebugHttpFn(async () => {
  return checkNotifications();
});
