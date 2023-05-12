import { FireCollection } from '@shared/firestore-collections';
import { NotificationDocument, NotificationDocumentField } from '@shared/types';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';
import { asyncLoadFirestore } from '../firebase/loaders';

const createNotificationRepo = async () => {
  const { firestore, ...sdk } = await asyncLoadFirestore();

  return new FireWebCollectionRepository<
    NotificationDocument,
    NotificationDocumentField
  >(firestore, sdk, FireCollection.notifications.path());
};

export const notificationRepo = createNotificationRepo();
