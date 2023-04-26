import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { FireCollection, ProfileDocument } from '@shared/types';
import { firestore } from '../firestore';

export const getProfileDocRef = (id: string) => {
  return firestore().doc(FireCollection.profiles.docPath(id));
};

export const getProfileById = async (profileId: string) => {
  return firestore()
    .doc(FireCollection.profiles.docPath(profileId))
    .get()
    .then((r) => firestoreSnapshotToData<ProfileDocument>(r));
};

export const updateProfileById = async (
  profileId: string,
  data: Partial<Omit<ProfileDocument, 'id'>>
) => {
  return firestore()
    .doc(FireCollection.profiles.docPath(profileId))
    .update(data);
};

export const createProfile = async (
  userId: string,
  data: Omit<ProfileDocument, 'id'>
) => {
  return firestore().doc(FireCollection.profiles.docPath(userId)).set(data);
};

export const deleteProfileById = async (userId: string) => {
  return firestore().doc(FireCollection.profiles.docPath(userId)).delete();
};
