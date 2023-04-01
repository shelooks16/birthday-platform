import { firestoreSnapshotListToData } from '@shared/firestore-utils';
import { FireCollection, NotificationDocument } from '@shared/types';
import { getFirestore } from 'firebase-admin/firestore';

type WhereClause = [
  keyof NotificationDocument,
  FirebaseFirestore.WhereFilterOp,
  any
];

export const getNotifications = async (...whereClauses: WhereClause[]) => {
  const firestore = getFirestore();

  let query = firestore.collection(
    FireCollection.notifications
  ) as FirebaseFirestore.Query;

  if (whereClauses.length > 0) {
    whereClauses.forEach((clause) => {
      query = query.where(clause[0], clause[1], clause[2]);
    });
  }

  return query
    .get()
    .then((r) => firestoreSnapshotListToData<NotificationDocument>(r.docs));
};

export const getNotificationsForBirthday = async (
  birthdayId: string,
  ...whereClauses: WhereClause[]
) => {
  return getNotifications(
    ['sourceBirthdayId', '==', birthdayId],
    ...whereClauses
  );
};
