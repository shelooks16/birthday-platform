import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  ChannelType,
  NotificationChannelDocument
} from '@shared/types';
import { FireCollection } from '@shared/firestore-collections';
import { createOnDeleteFunction } from '../utils/createFunction';
import { logger } from '../utils/logger';
import { birthdayRepo } from '../birthday/birthday.repository';
import { sendTelegramMessage } from '../telegram/sendMessage';
import { profileRepo } from '../profile/profile.repository';
import { useI18n } from '../i18n.context';
import { appConfig } from '../appConfig';

export const onChannelDeleteUpdateAffectedDocuments = createOnDeleteFunction(
  FireCollection.notificationChannel.docMatch,
  async (deleteEvent) => {
    const deletedChannel = firestoreSnapshotToData<NotificationChannelDocument>(
      deleteEvent.data
    )!;

    logger.info('Updating affected documents', {
      channelId: deletedChannel.id
    });

    const birthdaysToHandle = await birthdayRepo().findMany({
      where: [
        ['profileId', '==', deletedChannel.profileId],
        [
          'notificationSettings.notifyChannelsIds',
          'array-contains',
          deletedChannel.id
        ]
      ]
    });

    const updatedBirthdays: BirthdayDocument[] = birthdaysToHandle.map((b) => {
      const updatedChannelsIds =
        b.notificationSettings!.notifyChannelsIds.filter(
          (ch) => ch !== deletedChannel.id
        );

      return {
        ...b,
        notificationSettings:
          updatedChannelsIds.length > 0
            ? {
                ...b.notificationSettings!,
                notifyChannelsIds: updatedChannelsIds
              }
            : null
      };
    });

    const batch = birthdayRepo().batch();

    birthdayRepo().atomicUpdateMany(batch, updatedBirthdays);

    await batch.commit();

    logger.info('Updated affected documents', {
      channelId: deletedChannel.id,
      updatedBirthdaysCount: updatedBirthdays.length
    });
  }
);

export const onChannelDeleteSendByeMessage = createOnDeleteFunction(
  FireCollection.notificationChannel.docMatch,
  async (deleteEvent) => {
    const deletedChannel = firestoreSnapshotToData<NotificationChannelDocument>(
      deleteEvent.data
    )!;

    logger.info('Sending bye-bye message to channel', {
      type: deletedChannel.type
    });

    const profile = await profileRepo().findById(deletedChannel.profileId);

    if (!profile) {
      logger.info('Profile not found', {
        profileId: deletedChannel.profileId
      });
      return;
    }

    const i18n = await useI18n(profile.locale);

    switch (deletedChannel.type) {
      case ChannelType.telegram: {
        await sendTelegramMessage(
          deletedChannel.value,
          i18n.t('telegramBot.disconnectMessage', { name: profile.displayName })
        );

        break;
      }
      default: {
        logger.warn('Unhandled channel type', { type: deletedChannel.type });
      }
    }
  },
  {
    secrets: appConfig.secretsNames.telegramBot
  }
);
