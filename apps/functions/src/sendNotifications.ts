import * as functions from 'firebase-functions';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { getFirestore } from 'firebase-admin/firestore';
import { createOnCreateFunction } from './utils/createFunction';
import {
  FireCollection,
  NotificationDocument,
  SendNotificationDocument
} from '@shared/types';
import { sendEmail } from './email/sendEmail';

export const sendNotification = createOnCreateFunction(
  `${FireCollection.sendNotificationQueue}/{id}`,
  async (snap) => {
    const firestore = getFirestore();
    const docData = firestoreSnapshotToData<SendNotificationDocument>(snap)!;

    let notifiedChannelValues: string[] = [];

    switch (docData.channelType) {
      case 'email': {
        await sendEmail(docData.data);
        notifiedChannelValues = docData.data.to.split(',');

        break;
      }
      default:
        functions.logger.warn('Unhandled notification channel type', {
          sendNotificationDocId: docData.id,
          channelType: docData.channelType
        });
        return;
    }

    const now = new Date().toISOString();
    const updatesForItself: Partial<SendNotificationDocument> = {
      isSent: true,
      sentAt: now
    };
    const updateForNotification: Partial<NotificationDocument> = {
      notifiedNotifyChannels: notifiedChannelValues.reduce<
        Record<string, string>
      >((acc, val) => {
        const key = `${docData.channelType}:${val}`;
        return { ...acc, [key]: snap.ref.id };
      }, {})
    };

    const batch = firestore.batch();

    batch.update(snap.ref, updatesForItself);
    batch.set(
      firestore
        .collection(FireCollection.notifications)
        .doc(docData.sourceNotificationId),
      updateForNotification,
      { merge: true }
    );

    await batch.commit();
  }
);
