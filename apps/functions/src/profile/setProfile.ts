import { logger } from '../utils/logger';
import { FireCollection, ProfileDocument } from '@shared/types';
import { createAuthFunction } from '../utils/createFunction';
import { getFirestore } from 'firebase-admin/firestore';
import { getTimestamp } from '@shared/firestore-utils';
import { makeEmailChannel } from '@shared/notification-channels';

export const createProfileForUser = createAuthFunction(
  'onCreate',
  async (user) => {
    logger.info('Creating profile for user', { uid: user.uid });

    const firestore = getFirestore();

    const profile: Omit<ProfileDocument, 'id'> = {
      createdAt: getTimestamp(),
      displayName: user.displayName || user.email || user.uid,
      verifiedNotifyChannels:
        user.email && user.emailVerified ? [makeEmailChannel(user.email)] : []
    };

    await firestore
      .collection(FireCollection.profiles)
      .doc(user.uid)
      .set(profile);

    logger.info('Created user profile', { uid: user.uid });
  }
);

export const deleteProfileForUser = createAuthFunction(
  'onDelete',
  async (user) => {
    logger.info('Deleting profile for user', { uid: user.uid });

    await getFirestore()
      .collection(FireCollection.profiles)
      .doc(user.uid)
      .delete();

    logger.info('Deleted user profile', { uid: user.uid });
  }
);
