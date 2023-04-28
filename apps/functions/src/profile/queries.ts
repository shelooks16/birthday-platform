import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { FireCollection, ProfileDocument } from '@shared/types';
import { firestore } from '../firestore';

export const getProfileDocRef = (id: string) => {
  return firestore().doc(FireCollection.profiles.docPath(id));
};

export const getProfileById = async (id: string) => {
  return getProfileDocRef(id)
    .get()
    .then((r) => firestoreSnapshotToData<ProfileDocument>(r));
};

export const updateProfileById = async (
  id: string,
  data: Partial<Omit<ProfileDocument, 'id'>>
) => {
  return getProfileDocRef(id).update(data);
};

export const createProfile = (
  id: string,
  data: Omit<ProfileDocument, 'id'>,
  batch?: FirebaseFirestore.WriteBatch
) => {
  if (batch) {
    return batch.set(getProfileDocRef(id), data);
  }

  return getProfileDocRef(id).set(data);
};

export const deleteProfileById = async (id: string) => {
  return getProfileDocRef(id).delete();
};
