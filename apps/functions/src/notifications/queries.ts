import { joinWhereClauses } from '@shared/firestore-admin-utils';
import {
  firestoreSnapshotListToData,
  WhereClause
} from '@shared/firestore-utils';
import {
  FireCollection,
  NotificationDocument,
  NotificationDocumentField
} from '@shared/types';
import { firestore } from '../firestore';

export const getNotificationDoc = (id?: string) => {
  return id
    ? firestore().doc(FireCollection.notifications.docPath(id))
    : firestore().collection(FireCollection.notifications.path()).doc();
};

export const getNotifications = async (
  ...whereClauses: WhereClause<NotificationDocumentField>[]
) => {
  let query = firestore().collection(FireCollection.notifications.path());
  query = joinWhereClauses(query, whereClauses);

  return query
    .get()
    .then((r) => firestoreSnapshotListToData<NotificationDocument>(r.docs));
};

export const updateNotificationById = async (
  id: string,
  data: Partial<Omit<NotificationDocument, 'id'>>
) => {
  return getNotificationDoc(id).update(data);
};

export const deleteNotificationById = async (
  id: string,
  batch?: FirebaseFirestore.WriteBatch
) => {
  if (batch) {
    return batch.delete(getNotificationDoc(id));
  }

  return getNotificationDoc(id).delete();
};

export const createNotification = (
  data: Omit<NotificationDocument, 'id'>,
  batch?: FirebaseFirestore.WriteBatch
) => {
  if (batch) {
    return batch.set(getNotificationDoc(), data);
  }

  return getNotificationDoc().set(data);
};
