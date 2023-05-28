import { BirthdayDocument } from '@shared/types';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { logger } from '../utils/logger';
import { createOnDeleteFunction } from '../utils/createFunction';
import { FireCollection } from '@shared/firestore-collections';
import { birthdayWishRepo } from './birthdayWish.repository';

export const cleanupWishesOnBirthdayDeleted = createOnDeleteFunction(
  FireCollection.birthdays.docMatch,
  async (snap) => {
    const deletedBirthday = firestoreSnapshotToData<BirthdayDocument>(snap)!;

    logger.info('Cleaning up birthday wishes', {
      birthdayId: deletedBirthday.id
    });

    const wishes = await birthdayWishRepo().findMany({
      where: [['birthdayId', '==', deletedBirthday.id]]
    });

    const batch = birthdayWishRepo().batch();

    birthdayWishRepo().atomicDeleteMany(batch, wishes);

    await batch.commit();

    logger.info('Cleaned up birthday wishes', {
      birthdayId: deletedBirthday.id
    });
  }
);
