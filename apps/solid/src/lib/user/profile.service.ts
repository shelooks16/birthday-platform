import { ProfileDocument } from '@shared/types';
import { asyncLoadAuth } from '../firebase/loaders';
import { previewModeProxy } from '../previewMode/preview-mode.context';

export const profileService = previewModeProxy(
  {
    async db() {
      return import('./profile.repository').then((mod) => mod.profileRepo);
    },
    isProfileCompleted(profile: ProfileDocument) {
      return profile.timeZone && profile.locale;
    },
    async $getMyProfile(listener: (data: ProfileDocument | null) => void) {
      const { auth } = await asyncLoadAuth();
      const db = await this.db();

      return db.$findById(auth.currentUser!.uid, listener);
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
    },
    async deleteMyProfile() {
      const { auth } = await asyncLoadAuth();
      const db = await this.db();

      await db.deleteById(auth.currentUser!.uid);
    }
  },
  ['isProfileCompleted']
);
