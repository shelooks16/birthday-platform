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
import { createTelegramBot } from '../telegram/createTelegramBot';

export const onChannelDeleteUpdateAffectedDocuments = createOnDeleteFunction(
  FireCollection.notificationChannel.docMatch,
  async (snap) => {
    const deletedChannel =
      firestoreSnapshotToData<NotificationChannelDocument>(snap)!;

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
  async (snap) => {
    const deletedChannel =
      firestoreSnapshotToData<NotificationChannelDocument>(snap)!;

    logger.info('Sending bye-bye message to channel', {
      type: deletedChannel.type
    });

    switch (deletedChannel.type) {
      case ChannelType.telegram: {
        const bot = await createTelegramBot();

        await bot.telegram.sendMessage(
          deletedChannel.value,
          'Этот бот был отключен для нотификаций.'
        );
        break;
      }
      default: {
        logger.warn('Unhandled channel type', { type: deletedChannel.type });
      }
    }
  }
);
