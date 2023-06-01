import { ProfileDocument } from '@shared/types';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { logger } from '../utils/logger';
import { createOnDeleteFunction } from '../utils/createFunction';
import { FireCollection } from '@shared/firestore-collections';
import { auth } from '../auth';
import { birthdayRepo } from '../birthday/birthday.repository';
import { emailVerificationRepo } from '../emailVerification/emailVerification.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';

export const deleteUserOnProfileDeleted = createOnDeleteFunction(
  FireCollection.profiles.docMatch,
  async (deleteEvent) => {
    const deletedProfile = firestoreSnapshotToData<ProfileDocument>(
      deleteEvent.data
    )!;

    logger.info('Deleting user', {
      profileId: deletedProfile.id
    });

    try {
      await auth().deleteUser(deletedProfile.id);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        //
      } else {
        throw err;
      }
    }

    logger.info('User deleted', {
      profileId: deletedProfile.id
    });
  }
);

export const cleanupProfileDataOnProfileDeleted = createOnDeleteFunction(
  FireCollection.profiles.docMatch,
  async (deleteEvent) => {
    const deletedProfile = firestoreSnapshotToData<ProfileDocument>(
      deleteEvent.data
    )!;

    logger.info('Cleaning up profile data', {
      profileId: deletedProfile.id
    });

    const [birthdays, emailVerifications, notificationChannels] =
      await Promise.all([
        birthdayRepo().findMany({
          where: [['profileId', '==', deletedProfile.id]]
        }),
        emailVerificationRepo().findMany({
          where: [['profileId', '==', deletedProfile.id]]
        }),
        notificationChannelRepo().findMany({
          where: [['profileId', '==', deletedProfile.id]]
        })
      ]);

    const batch = birthdayRepo().batch();

    birthdayRepo().atomicDeleteMany(batch, birthdays);
    emailVerificationRepo().atomicDeleteMany(batch, emailVerifications);
    notificationChannelRepo().atomicDeleteMany(batch, notificationChannels);

    await batch.commit();

    logger.info('Cleaned up profile data', {
      profileId: deletedProfile.id
    });
  }
);
