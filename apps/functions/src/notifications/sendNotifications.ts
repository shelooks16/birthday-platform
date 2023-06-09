import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { FireCollection } from '@shared/firestore-collections';
import { fieldDelete } from '@shared/firestore-admin-utils';
import { ChannelType, NotificationDocument } from '@shared/types';
import { logger } from '../utils/logger';
import { createOnUpdateFunction } from '../utils/createFunction';
import { sendEmail } from '../email/sendEmail';
import { sendTelegramMessage } from '../telegram/sendMessage';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { notificationRepo } from './notification.repository';
import { birthdayRepo } from '../birthday/birthday.repository';
import { profileRepo } from '../profile/profile.repository';
import { useI18n } from '../i18n.context';
import { appConfig } from '../appConfig';

export const sendNotification = createOnUpdateFunction(
  FireCollection.notifications.docMatch,
  async (updateEvent) => {
    const notificationBefore = firestoreSnapshotToData<NotificationDocument>(
      updateEvent.data.before
    )!;
    const notificationAfter = firestoreSnapshotToData<NotificationDocument>(
      updateEvent.data.after
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

    const birthday = await birthdayRepo().findById(
      notificationAfter.sourceBirthdayId
    );

    if (!birthday) {
      logger.info('Exiting. Birthday does not exist', {
        birthdayId: notificationAfter.sourceBirthdayId
      });
      return;
    }

    const profile = await profileRepo().findById(birthday.profileId);

    if (!profile) {
      logger.info('Exiting. Profile does not exist', {
        profileId: birthday.profileId
      });
      return;
    }

    const i18n = await useI18n(profile.locale);
    const birthdayDate = new Date(
      new Date().getFullYear(),
      birthday.birth.month,
      birthday.birth.day
    );

    try {
      switch (channel.type) {
        case ChannelType.email: {
          await sendEmail({
            to: channel.value as string,
            subject: i18n.t('email.templates.birthdaySoon.subject', {
              buddyName: birthday.buddyName
            }),
            html: i18n.t('email.templates.birthdaySoon.html', {
              name: profile.displayName,
              buddyName: birthday.buddyName,
              birthday: i18n.format.dateToDayMonth(birthdayDate)
            })
          });

          break;
        }
        case ChannelType.telegram: {
          await sendTelegramMessage(
            channel.value,
            i18n.t('telegramBot.notificationMessage', {
              buddyName: birthday.buddyName,
              birthday: i18n.format.dateToDayMonth(birthdayDate)
            })
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
  },
  {
    secrets: [
      ...appConfig.secretsNames.email,
      ...appConfig.secretsNames.telegramBot
    ]
  }
);
