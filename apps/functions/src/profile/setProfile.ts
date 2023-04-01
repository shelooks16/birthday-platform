import * as functions from 'firebase-functions';
import { FireCollection, ProfileDocument } from '@shared/types';
import { createAuthFunction } from '../utils/createFunction';
import { getFirestore } from 'firebase-admin/firestore';
import { getTimestamp } from '@shared/firestore-utils';
import { createEmailChannel } from '@shared/notification-channels';

export const createProfileForUser = createAuthFunction(
  'onCreate',
  async (user) => {
    functions.logger.info('Creating profile for user', { uid: user.uid });

    const firestore = getFirestore();

    const profile: Omit<ProfileDocument, 'id'> = {
      createdAt: getTimestamp(),
      displayName: user.displayName || user.email || user.uid,
      verifiedNotifyChannels:
        user.email && user.emailVerified ? [createEmailChannel(user.email)] : []
    };

    await firestore
      .collection(FireCollection.profiles)
      .doc(user.uid)
      .set(profile);

    functions.logger.info('Created user profile', { uid: user.uid });
  }
);

export const deleteProfileForUser = createAuthFunction(
  'onDelete',
  async (user) => {
    functions.logger.info('Deleting profile for user', { uid: user.uid });

    await getFirestore()
      .collection(FireCollection.profiles)
      .doc(user.uid)
      .delete();

    functions.logger.info('Deleted user profile', { uid: user.uid });
  }
);
