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
    data: NewBirthdayData & { profileId: string }
  ): Promise<BirthdayDocument> {
    const entry: BirthdayDocument = {
      ...data,
      id: this.getRandomDocId(),
      createdAt: getTimestamp()
    };

    await this.setOne(entry);

    return entry;
  }

  async updateBirthday(data: WithId<NewBirthdayData>) {
    const { deleteField } = this.firestoreSdk as BirthdayRepoFireSdk;

    const updates: WithId<NewBirthdayData> = {
      ...data,
      buddyDescription: data.buddyDescription || (deleteField() as any)
    };

    await this.updateOne(updates);
  }
}

const createBirthdayRepo = async () => {
  const { firestore, ...sdk } = await asyncLoadFirestore();

  return new BirthdayRepo(firestore, sdk);
};

export const birthdayRepo = createBirthdayRepo();
