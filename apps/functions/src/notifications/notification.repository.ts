import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { FireCollection } from '@shared/firestore-collections';
import { MemoryCache } from '@shared/memory-cache';
import { NotificationDocument, NotificationDocumentField } from '@shared/types';
import { firestore } from '../firestore';

export const notificationRepo = () =>
  MemoryCache.getOrSet(
    FireCollection.notifications.docMatch,
    () =>
      new FireCollectionRepository<
        NotificationDocument,
        NotificationDocumentField
      >(firestore(), FireCollection.notifications.path())
  );
