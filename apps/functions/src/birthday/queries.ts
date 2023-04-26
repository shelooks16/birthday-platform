import { joinWhereClauses } from '@shared/firestore-admin-utils';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData,
  WhereClause
} from '@shared/firestore-utils';
import {
  BirthdayDocument,
  BirthdayDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';

export const getBirthdayDoc = (id: string) => {
  return firestore().doc(FireCollection.birthdays.docPath(id));
};

export const getBirthdayById = async (id: string) => {
  return firestore()
    .doc(FireCollection.birthdays.docPath(id))
    .get()
    .then((r) => firestoreSnapshotToData<BirthdayDocument>(r));
};

export const getBirthdays = async (
  ...whereClauses: WhereClause<BirthdayDocumentField>[]
) => {
  let query = firestore().collection(FireCollection.birthdays.path());
  query = joinWhereClauses(query, whereClauses);

  return query
    .get()
    .then((r) => firestoreSnapshotListToData<BirthdayDocument>(r.docs));
};
