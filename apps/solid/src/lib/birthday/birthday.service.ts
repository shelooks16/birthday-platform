import type { Firestore } from 'firebase/firestore';
import { FireCollection } from '@shared/firestore-collections';
import { getTimestamp, WithId } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  BirthdayDocumentField,
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { resolveCurrentLocale } from '../../i18n.context';
import { asyncLoadFirestore, asyncLoadFunctions } from '../firebase';
import { MemoryCache } from '@shared/memory-cache';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';
import { userService } from '../user/user.service';

export type NewBirthdayData = Pick<
  BirthdayDocument,
  'birth' | 'buddyName' | 'notificationSettings' | 'buddyDescription'
>;

class BirthdayRepo extends FireWebCollectionRepository<
  BirthdayDocument,
  BirthdayDocumentField
> {
  constructor(
    firestore: Firestore,
    firestoreSdk: typeof import('firebase/firestore')
  ) {
    super(firestore, firestoreSdk, FireCollection.birthdays.path());
  }

  async addNewBirthday(data: NewBirthdayData): Promise<BirthdayDocument> {
    const user = await userService.getAuthUser({ throwIfNull: true });

    const entry: BirthdayDocument = {
      ...data,
      id: this.getRandomDocId(),
      createdAt: getTimestamp(),
      profileId: user!.uid
    };

    await this.setOne(entry);

    return entry;
  }

  async updateBirthday(
    id: string,
    data: NewBirthdayData
  ): Promise<BirthdayDocument> {
    const { deleteField } = this.firestoreInstance.firestoreSdk;

    const updates: WithId<NewBirthdayData> = {
      ...data,
      id,
      buddyDescription: data.buddyDescription || (deleteField() as any)
    };

    await this.updateOne(updates);

    return this.findById(id) as unknown as BirthdayDocument;
  }
}

export const birthdayService = {
  async db() {
    return MemoryCache.getOrSet(FireCollection.birthdays.docMatch, async () => {
      const [firestore, sdk] = await asyncLoadFirestore();

      return new BirthdayRepo(firestore, sdk);
    });
  },
  async generateBirthdayWish(
    payload: Omit<GenerateBirthdayWishPayload, 'language'>
  ) {
    const [functions, { httpsCallable }] = await asyncLoadFunctions();

    const sendGenerateBirthdayWish = httpsCallable<
      GenerateBirthdayWishPayload,
      GenerateBirthdayWishResult
    >(functions, 'generateBirthdayWish');

    return sendGenerateBirthdayWish({
      ...payload,
      language: resolveCurrentLocale()
    }).then((result) => result.data);
  }
};
