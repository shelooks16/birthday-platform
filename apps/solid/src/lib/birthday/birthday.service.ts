import { FireCollection } from '@shared/firestore-collections';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData,
  getTimestamp
} from '@shared/firestore-utils';
import {
  BirthdayDocument,
  BirthdayDocumentField,
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { typed } from '@shared/typescript-utils';
import { resolveCurrentLocale } from '../../i18n.context';
import {
  asyncLoadFirestore,
  asyncLoadFunctions,
  getAuthUser
} from '../firebase';

export type NewBirthdayData = Pick<
  BirthdayDocument,
  'birth' | 'buddyName' | 'notificationSettings' | 'buddyDescription'
>;

export const birthdayService = {
  async addNewBirthday(data: NewBirthdayData): Promise<BirthdayDocument> {
    const currentUser = await getAuthUser({ throwIfNull: true });
    const [db, { addDoc, collection }] = await asyncLoadFirestore();
    const createdAt = getTimestamp();

    const entry: Omit<BirthdayDocument, 'id'> = {
      ...data,
      profileId: currentUser!.uid,
      createdAt
    };

    const docRef = await addDoc(
      collection(db, FireCollection.birthdays.path()),
      entry
    );

    return {
      ...entry,
      id: docRef.id
    };
  },
  async updateBirthdayById(
    id: string,
    data: NewBirthdayData
  ): Promise<BirthdayDocument> {
    const [db, { updateDoc, doc, deleteField, getDoc }] =
      await asyncLoadFirestore();

    const updates: NewBirthdayData = {
      ...data,
      buddyDescription: data.buddyDescription || (deleteField() as any)
    };

    const docRef = doc(db, FireCollection.birthdays.docPath(id));

    await updateDoc(docRef, updates);

    return getDoc(docRef).then(
      (r) => firestoreSnapshotToData<BirthdayDocument>(r)!
    );
  },
  async deleteBirthdayById(id: string) {
    const [db, { deleteDoc, doc }] = await asyncLoadFirestore();

    const docRef = doc(db, FireCollection.birthdays.docPath(id));

    await deleteDoc(docRef);
  },
  async getBirthdaysByProfileId(id: string) {
    const [db, { collection, query, where, getDocs }] =
      await asyncLoadFirestore();

    const q = query(
      collection(db, FireCollection.birthdays.path()),
      where(typed<BirthdayDocumentField>('profileId'), '==', id)
    );

    return getDocs(q).then((r) =>
      firestoreSnapshotListToData<BirthdayDocument>(r.docs)
    );
  },
  async getBirthdaysForCurrentuser() {
    const currentUser = await getAuthUser({ throwIfNull: true });

    return birthdayService.getBirthdaysByProfileId(currentUser!.uid);
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
