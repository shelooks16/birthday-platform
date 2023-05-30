import { getTimestamp } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  BirthdayImportExport,
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { asyncLoadAuth, asyncLoadFunctions } from '../firebase/loaders';
import { downloadIntoFile } from './downloadFile';
import { previewModeProxy } from '../previewMode/preview-mode.context';

import type { NewBirthdayData } from './birthday.repository';
export type { NewBirthdayData } from './birthday.repository';

export const birthdayService = previewModeProxy({
  async db() {
    return import('./birthday.repository').then((mod) => mod.birthdayRepo);
  },
  async deleteById(id: string) {
    const db = await this.db();
    await db.deleteById(id);
  },
  async findForProfile(profileId: string) {
    const db = await this.db();

    return db.findMany({ where: [['profileId', '==', profileId]] });
  },
  async addBirthday(data: NewBirthdayData) {
    const db = await this.db();
    const { auth } = await asyncLoadAuth();

    return db.addNewBirthday({ ...data, profileId: auth.currentUser!.uid });
  },
  async updateBirthday(id: string, data: NewBirthdayData) {
    const db = await this.db();

    await db.updateBirthday({
      ...data,
      id
    });

    return db.findById(id) as unknown as BirthdayDocument;
  },
  async generateBirthdayWish(
    payload: Omit<GenerateBirthdayWishPayload, 'language'>
  ) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendGenerateBirthdayWish = httpsCallable<
      GenerateBirthdayWishPayload,
      GenerateBirthdayWishResult
    >(functions, 'generateBirthdayWish');

    return sendGenerateBirthdayWish(payload).then((result) => result.data);
  },
  async exportBirthdays() {
    const { auth } = await asyncLoadAuth();

    const db = await this.db();
    const birthdays = await db.findMany({
      where: [['profileId', '==', auth.currentUser!.uid]]
    });

    const exportedBirthdays = birthdays.map<BirthdayImportExport>((b) => ({
      buddyName: b.buddyName,
      buddyDescription: b.buddyDescription || '',
      birth: b.birth
    }));

    const fileName = downloadIntoFile(
      JSON.stringify(exportedBirthdays, null, 2),
      'birthdays_export',
      'json'
    );

    return {
      exportedBirthdays,
      fileName
    };
  },
  async importBirthdays(importedBirthdays: BirthdayImportExport[]) {
    const { auth } = await asyncLoadAuth();

    const db = await this.db();
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
});
