import { FireCollection } from '@shared/firestore-collections';
import { FireWebCollectionRepository } from '@shared/firestore-web-utils';
import { ProfileDocument, ProfileDocumentField } from '@shared/types';
import { asyncLoadFirestore } from '../firebase/loaders';

const createProfileRepo = async () => {
  const { firestore, ...sdk } = await asyncLoadFirestore();

  return new FireWebCollectionRepository<ProfileDocument, ProfileDocumentField>(
    firestore,
    sdk,
    FireCollection.profiles.path()
  );
};

export const profileRepo = createProfileRepo();
