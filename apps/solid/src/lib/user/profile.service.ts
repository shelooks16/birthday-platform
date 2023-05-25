import { ProfileDocument } from '@shared/types';
import { asyncLoadAuth } from '../firebase/loaders';

export const profileService = {
  async db() {
    return import('./profile.repository').then((mod) => mod.profileRepo);
  },
  isProfileCompleted(profile: ProfileDocument) {
    return profile.timeZone && profile.locale;
  },
  async getMyProfile() {
    const { auth } = await asyncLoadAuth();
    const db = await this.db();

    return db.findById(auth.currentUser!.uid);
  },
  async $getMyProfile(
    listener: (data: ProfileDocument | null) => void,
    onError?: (error: Error) => void
  ) {
    const { auth } = await asyncLoadAuth();
    const db = await this.db();

    return db.$findById(auth.currentUser!.uid, listener, onError);
  },
  async updateMyProfile(
    data: Pick<ProfileDocument, 'displayName' | 'timeZone' | 'locale'>
  ) {
    const { auth } = await asyncLoadAuth();
    const db = await this.db();

    await db.updateOne({
      ...data,
      id: auth.currentUser!.uid
    });
  }
};
