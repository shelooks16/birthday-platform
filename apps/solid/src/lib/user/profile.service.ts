import { FireCollection } from '@shared/firestore-collections';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';
import { MemoryCache } from '@shared/memory-cache';
import { ProfileDocument, ProfileDocumentField } from '@shared/types';
import { asyncLoadFirestore } from '../firebase/loaders';

export const profileService = {
  async db() {
    return MemoryCache.getOrSet(FireCollection.profiles.docMatch, async () => {
      const { firestore, ...sdk } = await asyncLoadFirestore();

      return new FireWebCollectionRepository<
        ProfileDocument,
        ProfileDocumentField
      >(firestore, sdk, FireCollection.profiles.path());
    });
  }
};
