import * as functions from 'firebase-functions';
import { createOnCreateFunction } from './utils/createFunction';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { FireCollection, SendNotificationDocument } from '@shared/types';
import { sendEmail } from './email/sendEmail';

export const sendNotification = createOnCreateFunction(
  `${FireCollection.sendNotificationQueue}/{id}`,
  async (snap) => {
    const docData = firestoreSnapshotToData<SendNotificationDocument>(snap)!;

    switch (docData.channel) {
      case 'email': {
        await sendEmail(docData.data);
        break;
      }
      default:
        functions.logger.warn('Unhandled notification channel', {
          sendNotificationDocId: docData.id,
          channel: docData.channel
        });
        return;
    }

    const updates: Partial<SendNotificationDocument> = {
      isSent: true,
      sentAt: new Date().toISOString()
    };

    await snap.ref.update(updates);
  }
);
