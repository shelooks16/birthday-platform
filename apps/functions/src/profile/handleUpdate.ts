import { getFirestore } from 'firebase-admin/firestore';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  FireCollection,
  ProfileDocument
} from '@shared/types';
import { createOnUpdateFunction } from '../utils/createFunction';
import { logger } from '../utils/logger';
import { getBirthdays } from '../birthday/queries';

export const updateBirthdaysOnVerifiedChannelsChange = createOnUpdateFunction(
  `${FireCollection.profiles}/{id}`,
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

    logger.info('User removed verified channels. Updating affected birthdays', {
      uid: profileAfter.id,
      removedChannelsCount: removedVerifiedChannels.length
    });

    const birthdaysToHandle = await getBirthdays(
      ['userId', '==', profileAfter.id],
      [
        'notificationSettings.notifyChannels',
        'array-contains-any',
        removedVerifiedChannels
      ]
    );

    const firestore = getFirestore();

    const batch = firestore.batch();

    birthdaysToHandle.forEach((b) => {
      const updatedNotifyChannels =
        b.notificationSettings!.notifyChannels.filter(
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

      batch.update(
        firestore.collection(FireCollection.birthdays).doc(b.id),
        updates
      );
    });

    await batch.commit();

    logger.info('Updated affected birthdays', {
      uid: profileAfter.id,
      updateCount: birthdaysToHandle.length
    });
  }
);
