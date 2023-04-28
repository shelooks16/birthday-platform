import { logger } from '../utils/logger';
import { createAuthFunction } from '../utils/createFunction';
import { getTimestamp } from '@shared/firestore-utils';
import { createProfile, deleteProfileById } from './queries';
import { createNotificationChannel } from '../notificationChannel/queries';
import { firestore } from '../firestore';
import { ChannelType } from '@shared/types';

export const createProfileForUser = createAuthFunction(
  'onCreate',
  async (user) => {
    logger.info('Creating profile for user', { userId: user.uid });

    const batch = firestore().batch();

    if (user.email && user.emailVerified) {
      createNotificationChannel(
        {
          profileId: user.uid,
          type: ChannelType.email,
          value: user.email,
          displayName: user.email,
          createdAt: getTimestamp()
        },
        batch
      );
    }

    createProfile(
      user.uid,
      {
        createdAt: getTimestamp(),
        displayName: user.displayName || user.email || user.uid,
        ...(user.photoURL ? { avatar: user.photoURL } : {})
      },
      batch
    );

    await batch.commit();

    logger.info('Created user profile', { userId: user.uid });
  }
);

export const deleteProfileForUser = createAuthFunction(
  'onDelete',
  async (user) => {
    logger.info('Deleting profile for user', { uid: user.uid });

    await deleteProfileById(user.uid);

    logger.info('Deleted user profile', { uid: user.uid });
  }
);
