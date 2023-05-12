import { FireCollection } from '@shared/firestore-collections';
import {
  NotificationChannelDocument,
  NotificationChannelDocumentField
} from '@shared/types';
import { asyncLoadFirestore } from '../firebase/loaders';
import { MemoryCache } from '@shared/memory-cache';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';

export const notificationChannelService = {
  async db() {
    return MemoryCache.getOrSet(
      FireCollection.notificationChannel.docMatch,
      async () => {
        const { firestore, ...sdk } = await asyncLoadFirestore();

        return new FireWebCollectionRepository<
          NotificationChannelDocument,
          NotificationChannelDocumentField
        >(firestore, sdk, FireCollection.notificationChannel.path());
      }
    );
  }
};
