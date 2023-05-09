import { FireCollection } from '@shared/firestore-collections';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData
} from '@shared/firestore-utils';
import {
  ChannelType,
  NotificationChannelDocument,
  NotificationChannelDocumentField
} from '@shared/types';
import { typed } from '@shared/general-utils';
import { orderBy } from 'firebase/firestore';
import { asyncLoadFirestore } from '../firebase';

export const notificationChannelService = {
  async getChannelsByProfileId(profileId: string) {
    const [db, { collection, query, where, getDocs }] =
      await asyncLoadFirestore();

    const q = query(
      collection(db, FireCollection.notificationChannel.path()),
      where(
        typed<NotificationChannelDocumentField>('profileId'),
        '==',
        profileId
      )
    );

    return getDocs(q).then((r) =>
      firestoreSnapshotListToData<NotificationChannelDocument>(r.docs)
    );
  },
  async $subToLatestChannelCreatedAfter(
    profileId: string,
    createdAfter: string,
    type: ChannelType,
    listener: (notificationChannel: NotificationChannelDocument) => void,
    onError?: (error: Error) => void
  ) {
    const [db, { collection, query, where, limitToLast, onSnapshot }] =
      await asyncLoadFirestore();

    const q = query(
      collection(db, FireCollection.notificationChannel.path()),
      where(
        typed<NotificationChannelDocumentField>('profileId'),
        '==',
        profileId
      ),
      where(typed<NotificationChannelDocumentField>('type'), '==', type),
      where(
        typed<NotificationChannelDocumentField>('createdAt'),
        '>',
        createdAfter
      ),
      limitToLast(1),
      orderBy(typed<NotificationChannelDocumentField>('createdAt'))
    );

    return onSnapshot(
      q,
      (snap) => {
        if (snap.docs.length) {
          listener(
            firestoreSnapshotToData<NotificationChannelDocument>(snap.docs[0])!
          );
        }
      },
      onError
    );
  },
  async deleteChannelById(id: string) {
    const [db, { deleteDoc, doc }] = await asyncLoadFirestore();

    const docRef = doc(db, FireCollection.notificationChannel.docPath(id));

    await deleteDoc(docRef);
  }
};
