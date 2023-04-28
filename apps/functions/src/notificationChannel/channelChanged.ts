import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  ChannelType,
  FireCollection,
  NotificationChannelDocument
} from '@shared/types';
import { createOnDeleteFunction } from '../utils/createFunction';
import { logger } from '../utils/logger';
import { getBirthdays, updateBirthdayById } from '../birthday/queries';
import { createTelegramBot } from '../telegram/createTelegramBot';
import { firestore } from '../firestore';

export const onChannelDeleteUpdateAffectedDocuments = createOnDeleteFunction(
  FireCollection.notificationChannel.docMatch,
  async (snap) => {
    const deletedChannel =
      firestoreSnapshotToData<NotificationChannelDocument>(snap)!;

    logger.info('Updating affected documents', {
      channelId: deletedChannel.id
    });

    const birthdaysToHandle = await getBirthdays(
      ['profileId', '==', deletedChannel.profileId],
      [
        'notificationSettings.notifyChannelsIds',
        'array-contains',
        deletedChannel.id
      ]
    );

    const batch = firestore().batch();

    birthdaysToHandle.forEach((b) => {
      const updatedChannelsIds =
        b.notificationSettings!.notifyChannelsIds.filter(
          (ch) => ch !== deletedChannel.id
        );

      updateBirthdayById(
        b.id,
        {
          notificationSettings:
            updatedChannelsIds.length > 0
              ? {
                  ...b.notificationSettings!,
                  notifyChannelsIds: updatedChannelsIds
                }
              : null
        },
        batch
      );
    });

    await batch.commit();

    logger.info('Updated affected documents', {
      channelId: deletedChannel.id,
      updatedBirthdaysCount: birthdaysToHandle.length
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
