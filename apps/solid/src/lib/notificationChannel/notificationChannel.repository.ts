import { FireCollection } from '@shared/firestore-collections';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';
import {
  NotificationChannelDocument,
  NotificationChannelDocumentField
} from '@shared/types';
import { asyncLoadFirestore } from '../firebase/loaders';

const createNotificationChannelRepo = async () => {
  const { firestore, ...sdk } = await asyncLoadFirestore();

  return new FireWebCollectionRepository<
    NotificationChannelDocument,
    NotificationChannelDocumentField
  >(firestore, sdk, FireCollection.notificationChannel.path());
};

export const notificationChannelRepo = createNotificationChannelRepo();
