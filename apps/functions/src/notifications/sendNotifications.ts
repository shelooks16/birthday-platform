import * as functions from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { FireCollection, NotificationDocument } from '@shared/types';
import {
  extractChannelType,
  isEmailChannel,
  getEmailFromEmailChannel
} from '@shared/notification-channels';
import { createOnUpdateFunction } from '../utils/createFunction';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';

export const sendNotification = createOnUpdateFunction(
  `${FireCollection.notifications}/{id}`,
  async (change) => {
    const notificationBefore = firestoreSnapshotToData<NotificationDocument>(
      change.before
    )!;
    const notificationAfter = firestoreSnapshotToData<NotificationDocument>(
      change.after
    )!;

    const mustSend =
      !notificationBefore.isScheduled && notificationAfter.isScheduled;

    if (!mustSend) {
      functions.logger.info('Skipping sending notification', {
        notificationId: notificationAfter.id
      });
      return;
    }

    let updates: Partial<NotificationDocument>;

    try {
      if (isEmailChannel(notificationAfter.notifyChannel)) {
        await sendEmail({
          to: getEmailFromEmailChannel(notificationAfter.notifyChannel),
          subject: mailTemplate.birthdaySoon.subject(),
          html: mailTemplate.birthdaySoon.html()
        });
      } else {
        const errMessage = 'Unhandled notification channel type';
        functions.logger.warn(errMessage, {
          sendNotificationDocId: notificationAfter.id,
          channelType: extractChannelType(notificationAfter.notifyChannel)
        });
        throw new Error(errMessage);
      }

      updates = {
        isSent: true,
        sentAt: getTimestamp(),
        error: FieldValue.delete() as any
      };
    } catch (err) {
      updates = {
        isSent: false,
        isScheduled: false,
        error: err.message
      };
    }

    await change.after.ref.update(updates);
  }
);
