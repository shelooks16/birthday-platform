import { logger } from '../utils/logger';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { fieldDelete } from '../../../../packages/firestore-admin-utils';
import { FireCollection, NotificationDocument } from '@shared/types';
import { ChannelType, parseChannel } from '@shared/notification-channels';
import { createOnUpdateFunction } from '../utils/createFunction';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';
import { createTelegramBot } from '../telegram/createTelegramBot';

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

    let updates: Partial<NotificationDocument>;

    const parsedChannel = parseChannel(notificationAfter.notifyChannel);

    try {
      switch (parsedChannel.type) {
        case ChannelType.email: {
          await sendEmail({
            to: parsedChannel.id,
            subject: mailTemplate.birthdaySoon.subject(),
            html: mailTemplate.birthdaySoon.html()
          });
          break;
        }
        case ChannelType.telegram: {
          const bot = await createTelegramBot();

          await bot.telegram.sendMessage(
            parsedChannel.id,
            `Днюха уже очень скоро ${notificationAfter.sourceBirthdayId}`
          );

          break;
        }
        default: {
          const errMessage = 'Unhandled notification channel type';
          logger.warn(errMessage, {
            sendNotificationDocId: notificationAfter.id,
            channelType: parsedChannel.type
          });
          throw new Error(errMessage);
        }
      }

      updates = {
        isSent: true,
        sentAt: getTimestamp(),
        error: fieldDelete()
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
