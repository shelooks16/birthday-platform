import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData
} from '@shared/firestore-utils';
import {
  BirthdayDocument,
  FireCollection,
  FlattenInterfaceKeys
} from '@shared/types';
import { getFirestore } from 'firebase-admin/firestore';

export const getBirthdayById = async (id: string) => {
  const firestore = getFirestore();

  return firestore
    .collection(FireCollection.birthdays)
    .doc(id)
    .get()
    .then((r) => firestoreSnapshotToData<BirthdayDocument>(r));
};

type WhereClause = [
  FlattenInterfaceKeys<BirthdayDocument>,
  FirebaseFirestore.WhereFilterOp,
  any
];

export const getBirthdays = async (...whereClauses: WhereClause[]) => {
  const firestore = getFirestore();

  let query = firestore.collection(
    FireCollection.birthdays
  ) as FirebaseFirestore.Query;

  if (whereClauses.length > 0) {
    whereClauses.forEach((clause) => {
      query = query.where(clause[0]!, clause[1], clause[2]);
    });
  }

  return query
    .get()
    .then((r) => firestoreSnapshotListToData<BirthdayDocument>(r.docs));
};
