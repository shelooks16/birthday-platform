import { getTimestamp } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  BirthdayImportExport,
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { resolveCurrentLocale } from '../../i18n.context';
import { asyncLoadAuth, asyncLoadFunctions } from '../firebase/loaders';

export const birthdayService = {
  async db() {
    return import('./birthday.repository').then((mod) => mod.birthdayRepo);
  },
  async generateBirthdayWish(
    payload: Omit<GenerateBirthdayWishPayload, 'language'>
  ) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendGenerateBirthdayWish = httpsCallable<
      GenerateBirthdayWishPayload,
      GenerateBirthdayWishResult
    >(functions, 'generateBirthdayWish');

    return sendGenerateBirthdayWish({
      ...payload,
      language: resolveCurrentLocale()
    }).then((result) => result.data);
  },
  async exportBirthdays() {
    const { auth } = await asyncLoadAuth();

    const db = await birthdayService.db();
    const birthdays = await db.findMany({
      where: [['profileId', '==', auth.currentUser!.uid]]
    });

    return birthdays.map<BirthdayImportExport>((b) => ({
      buddyName: b.buddyName,
      buddyDescription: b.buddyDescription || '',
      birth: b.birth
    }));
  },
  async importBirthdays(importedBirthdays: BirthdayImportExport[]) {
    const { auth } = await asyncLoadAuth();

    const db = await birthdayService.db();
    const batch = db.batch();

    const birthdays = importedBirthdays.map<BirthdayDocument>((b) => ({
      id: db.getRandomDocId(),
      birth: b.birth,
      buddyName: b.buddyName,
      ...(b.buddyDescription ? { buddyDescription: b.buddyDescription } : {}),
      createdAt: getTimestamp(),
      notificationSettings: null,
      profileId: auth.currentUser!.uid
    }));

    db.atomicSetMany(batch, birthdays);

    await batch.commit();

    return birthdays;
  }
};
