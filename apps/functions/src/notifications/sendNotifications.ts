import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { FireCollection } from '@shared/firestore-collections';
import { fieldDelete } from '@shared/firestore-admin-utils';
import { ChannelType, NotificationDocument } from '@shared/types';
import { logger } from '../utils/logger';
import { createOnUpdateFunction } from '../utils/createFunction';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';
import { createTelegramBot } from '../telegram/createTelegramBot';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { notificationRepo } from './notification.repository';

export const sendNotification = createOnUpdateFunction(
  FireCollection.notifications.docMatch,
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
      logger.info('Skipping sending notification', {
        notificationId: notificationAfter.id
      });
      return;
    }

    const channel = await notificationChannelRepo().findById(
      notificationAfter.notificationChannelId
    );

    if (!channel) {
      logger.info('Exiting. Notification channel does not exist', {
        notificationChannelId: notificationAfter.notificationChannelId
      });
      return;
    }

    try {
      switch (channel.type) {
        case ChannelType.email: {
          await sendEmail({
            to: channel.value as string,
            subject: mailTemplate.birthdaySoon.subject(),
            html: mailTemplate.birthdaySoon.html()
          });
          break;
        }
        case ChannelType.telegram: {
          const bot = await createTelegramBot();

          await bot.telegram.sendMessage(
            channel.value,
            `Днюха уже очень скоро ${notificationAfter.sourceBirthdayId}`
          );

          break;
        }
        default: {
          const errMessage = 'Unhandled notification channel type';
          logger.warn(errMessage, {
            sendNotificationDocId: notificationAfter.id,
            channelType: channel.type
          });
          throw new Error(errMessage);
        }
      }

      await notificationRepo().updateOne({
        id: notificationAfter.id,
        isSent: true,
        sentAt: getTimestamp(),
        error: fieldDelete()
      });
    } catch (err) {
      await notificationRepo().updateOne({
        id: notificationAfter.id,
        isSent: false,
        isScheduled: false,
        error: err.message
      });
    }
  }
);
