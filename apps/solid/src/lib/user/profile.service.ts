import { firestoreSnapshotToData } from '@shared/firestore-utils';
import { FireCollection, ProfileDocument } from '@shared/types';
import { asyncLoadFirestore, getAuthUser } from '../firebase';

export const profileService = {
  async getProfileByUserId(id: string) {
    const [db, { doc, getDoc }] = await asyncLoadFirestore();

    const docSnap = await getDoc(doc(db, FireCollection.profiles.docPath(id)));

    return firestoreSnapshotToData<ProfileDocument>(docSnap);
  },
  async getProfileForCurrentUser() {
    const currentUser = await getAuthUser({ throwIfNull: true });

    return this.getProfileByUserId(currentUser!.uid);
  },
  async updateProfileById(id: string, data: Pick<ProfileDocument, 'timeZone'>) {
    const [db, { doc, updateDoc }] = await asyncLoadFirestore();

    const userDoc = doc(db, FireCollection.profiles.docPath(id));

    await updateDoc(userDoc, data);

    return this.getProfileByUserId(id).then((r) => r!);
  },
  async updateCurrentUserProfile(
    data: Partial<Pick<ProfileDocument, 'timeZone'>>
  ) {
    const currentUser = await getAuthUser({ throwIfNull: true });

    return this.updateProfileById(currentUser!.uid, data);
  },
  async $subToProfile(
    id: string,
    listener: (profile: ProfileDocument | null) => void,
    onError?: (error: Error) => void
  ) {
    const [db, { onSnapshot, doc }] = await asyncLoadFirestore();

    return onSnapshot(
      doc(db, FireCollection.profiles.docPath(id)),
      (snap) => {
        listener(firestoreSnapshotToData<ProfileDocument>(snap));
      },
      onError
    );
  }
};
