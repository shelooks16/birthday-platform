import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { BirthdayDocument, FireCollection } from '@shared/types';
import { getFirestore } from 'firebase-admin/firestore';

export const getBirthdayById = async (id: string) => {
  const firestore = getFirestore();

  return firestore
    .collection(FireCollection.birthdays)
    .doc(id)
    .get()
    .then((r) => firestoreSnapshotToData<BirthdayDocument>(r));
};
