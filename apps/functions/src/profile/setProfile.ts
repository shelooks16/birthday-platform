import { ChannelType } from '@shared/types';
import { getTimestamp } from '@shared/firestore-utils';
import { logger } from '../utils/logger';
import { createAuthFunction } from '../utils/createFunction';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { profileRepo } from './profile.repository';

export const createProfileForUser = createAuthFunction(
  'onCreate',
  async (user) => {
    logger.info('Creating profile for user', { userId: user.uid });

    const batch = profileRepo().batch();

    if (user.email && user.emailVerified) {
      notificationChannelRepo().atomicSetOne(batch, {
        profileId: user.uid,
        type: ChannelType.email,
        value: user.email,
        displayName: user.email,
        createdAt: getTimestamp()
      });
    }

    profileRepo().atomicSetOne(batch, {
      id: user.uid,
      createdAt: getTimestamp(),
      displayName: user.displayName || user.email || user.uid,
      botPairingCode: profileRepo().getRandomDocId(),
      ...(user.photoURL ? { avatar: user.photoURL } : {})
    });

    await batch.commit();

    logger.info('Created user profile', { userId: user.uid });
  }
);

export const deleteProfileForUser = createAuthFunction(
  'onDelete',
  async (user) => {
    logger.info('Deleting profile for user', { uid: user.uid });

    await profileRepo().deleteById(user.uid);

    logger.info('Deleted user profile', { uid: user.uid });
  }
);
