import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import {
  NotificationDocument,
  NotificationDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';
import { withMemoryCache } from '../utils/memoryCache';

export const notificationRepo = () =>
  withMemoryCache(
    () =>
      new FireCollectionRepository<
        NotificationDocument,
        NotificationDocumentField
      >(firestore(), FireCollection.notifications.path()),
    FireCollection.notifications.docMatch
  );
