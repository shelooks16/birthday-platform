import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import {
  ProfileDocument,
  ProfileDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';
import { withMemoryCache } from '../utils/memoryCache';

export const profileRepo = () =>
  withMemoryCache(
    () =>
      new FireCollectionRepository<ProfileDocument, ProfileDocumentField>(
        firestore(),
        FireCollection.profiles.path()
      ),
    FireCollection.profiles.docMatch
  );
