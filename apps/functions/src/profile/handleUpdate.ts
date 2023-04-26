import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  FireCollection,
  ProfileDocument
} from '@shared/types';
import { createOnUpdateFunction } from '../utils/createFunction';
import { logger } from '../utils/logger';
import { getBirthdayDoc, getBirthdays } from '../birthday/queries';
import { parseChannel } from '@shared/notification-channels';
import { createTelegramBot } from '../telegram/createTelegramBot';
import { firestore } from '../firestore';

export const updateBirthdaysOnVerifiedChannelsChange = createOnUpdateFunction(
  FireCollection.profiles.docMatch,
  async (change) => {
    const profileBefore = firestoreSnapshotToData<ProfileDocument>(
      change.before
    )!;
    const profileAfter = firestoreSnapshotToData<ProfileDocument>(
      change.after
    )!;

    const removedVerifiedChannels = profileBefore.verifiedNotifyChannels.filter(
      (ch) => !profileAfter.verifiedNotifyChannels.includes(ch)
    );

    if (!removedVerifiedChannels.length) {
      return;
    }

    logger.info('User removed verified channels', {
      uid: profileAfter.id,
      removedChannelsCount: removedVerifiedChannels.length
    });

    await updateAffectedBirthdays(profileAfter, removedVerifiedChannels);
    await sendNotificationToChannelsAboutRemoval(removedVerifiedChannels);
  }
);

async function updateAffectedBirthdays(
  profile: ProfileDocument,
  removedVerifiedChannels: string[]
) {
  logger.info('Updating affected birthdays');

  const birthdaysToHandle = await getBirthdays(
    ['userId', '==', profile.id],
    [
      'notificationSettings.notifyChannels',
      'array-contains-any',
      removedVerifiedChannels
    ]
  );

  const batch = firestore().batch();

  birthdaysToHandle.forEach((b) => {
    const updatedNotifyChannels = b.notificationSettings!.notifyChannels.filter(
      (ch) => !removedVerifiedChannels.includes(ch)
    );

    const updates: Partial<BirthdayDocument> = {
      notificationSettings:
        updatedNotifyChannels.length > 0
          ? {
              ...b.notificationSettings!,
              notifyChannels: updatedNotifyChannels
            }
          : null
    };

    batch.update(getBirthdayDoc(b.id), updates);
  });

  await batch.commit();

  logger.info('Updated affected birthdays', {
    uid: profile.id,
    updateCount: birthdaysToHandle.length
  });
}

async function sendNotificationToChannelsAboutRemoval(
  removedVerifiedChannels: string[]
) {
  for (const channel of removedVerifiedChannels) {
    const { id, type } = parseChannel(channel);
    if (type === 'telegram') {
      const bot = await createTelegramBot();

      await bot.telegram.sendMessage(
        id,
        'Этот бот был отключен для нотификаций.'
      );
    }
  }
}
