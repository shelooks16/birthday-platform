import { logger } from '../utils/logger';
import { ProfileDocument } from '@shared/types';
import { createAuthFunction } from '../utils/createFunction';
import { getTimestamp } from '@shared/firestore-utils';
import { emailChannel } from '@shared/notification-channels';
import { createProfile, deleteProfileById } from './queries';

export const createProfileForUser = createAuthFunction(
  'onCreate',
  async (user) => {
    logger.info('Creating profile for user', { uid: user.uid });

    const profile: Omit<ProfileDocument, 'id'> = {
      createdAt: getTimestamp(),
      displayName: user.displayName || user.email || user.uid,
      verifiedNotifyChannels:
        user.email && user.emailVerified ? [emailChannel.make(user.email)] : [],
      ...(user.photoURL ? { avatar: user.photoURL } : {})
    };

    await createProfile(user.uid, profile);

    logger.info('Created user profile', { uid: user.uid });
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
