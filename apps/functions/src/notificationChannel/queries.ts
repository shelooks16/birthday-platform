import { joinWhereClauses } from '@shared/firestore-admin-utils';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData,
  WhereClause
} from '@shared/firestore-utils';
import {
  ChannelType,
  FireCollection,
  NotificationChannelDocument,
  NotificationChannelDocumentField
} from '@shared/types';
import { typed } from '@shared/typescript-utils';
import { firestore } from '../firestore';

export const getNotificationChannelDoc = (id?: string) => {
  return id
    ? firestore().doc(FireCollection.notificationChannel.docPath(id))
    : firestore().collection(FireCollection.notificationChannel.path()).doc();
};

type GetNotificationChannelsOptions = {
  limit?: number;
};

export const getNotificationChannels = async (
  whereClauses: WhereClause<NotificationChannelDocumentField>[],
  options: GetNotificationChannelsOptions = {}
) => {
  const { limit } = options;

  let query = firestore().collection(FireCollection.notificationChannel.path());
  query = joinWhereClauses(query, whereClauses);

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query
    .get()
    .then((r) =>
      firestoreSnapshotListToData<NotificationChannelDocument>(r.docs)
    );
};

export const findNotificationChannelForProfile = async (
  id: string,
  type: ChannelType,
  value: string | number
) => {
  return firestore()
    .collection(FireCollection.notificationChannel.path())
    .where(typed<NotificationChannelDocumentField>('profileId'), '==', id)
    .where(typed<NotificationChannelDocumentField>('type'), '==', type)
    .where(typed<NotificationChannelDocumentField>('value'), '==', value)
    .limit(1)
    .get()
    .then((r) =>
      r.size === 0
        ? null
        : firestoreSnapshotToData<NotificationChannelDocument>(r.docs[0])
    );
};

export const createNotificationChannel = (
  data: Omit<NotificationChannelDocument, 'id'>,
  batch?: FirebaseFirestore.WriteBatch
) => {
  const doc = getNotificationChannelDoc();
  const finalDoc: NotificationChannelDocument = {
    ...data,
    id: doc.id
  };

  if (batch) {
    batch.set(doc, data);
    return finalDoc;
  }

  return doc.set(data).then(() => finalDoc);
};

export const updateNotificationChannelById = (
  id: string,
  data: Partial<Omit<NotificationChannelDocument, 'id'>>,
  batch?: FirebaseFirestore.WriteBatch
) => {
  if (batch) {
    return batch.update(getNotificationChannelDoc(id), data);
  }

  return getNotificationChannelDoc(id).update(data);
};

export const getNotificationChannelById = async (id: string) => {
  return getNotificationChannelDoc(id)
    .get()
    .then((r) => firestoreSnapshotToData<NotificationChannelDocument>(r));
};
