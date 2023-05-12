import type { Firestore } from 'firebase/firestore';
import { FireCollection } from '@shared/firestore-collections';
import { getTimestamp, WithId } from '@shared/firestore-utils';
import { BirthdayDocument, BirthdayDocumentField } from '@shared/types';
import {
  FirestoreSdk,
  FireWebCollectionRepository
} from '@shared/firestore-web-utils';
import { asyncLoadFirestore } from '../firebase/loaders';

export type NewBirthdayData = Pick<
  BirthdayDocument,
  'birth' | 'buddyName' | 'notificationSettings' | 'buddyDescription'
>;

type BirthdayRepoFireSdk = FirestoreSdk &
  Pick<typeof import('firebase/firestore'), 'deleteField'>;

class BirthdayRepo extends FireWebCollectionRepository<
  BirthdayDocument,
  BirthdayDocumentField
> {
  constructor(firestore: Firestore, firestoreSdk: BirthdayRepoFireSdk) {
    super(firestore, firestoreSdk, FireCollection.birthdays.path());
  }

  async addNewBirthday(
    profileId: string,
    data: NewBirthdayData
  ): Promise<BirthdayDocument> {
    const entry: BirthdayDocument = {
      ...data,
      profileId,
      id: this.getRandomDocId(),
      createdAt: getTimestamp()
    };

    await this.setOne(entry);

    return entry;
  }

  async updateBirthday(
    id: string,
    data: NewBirthdayData
  ): Promise<BirthdayDocument> {
    const { deleteField } = this.firestoreSdk as BirthdayRepoFireSdk;

    const updates: WithId<NewBirthdayData> = {
      ...data,
      id,
      buddyDescription: data.buddyDescription || (deleteField() as any)
    };

    await this.updateOne(updates);

    return this.findById(id) as unknown as BirthdayDocument;
  }
}

const createBirthdayRepo = async () => {
  const { firestore, ...sdk } = await asyncLoadFirestore();

  return new BirthdayRepo(firestore, sdk);
};

export const birthdayRepo = createBirthdayRepo();
