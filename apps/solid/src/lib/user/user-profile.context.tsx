import {
  createContext,
  ParentProps,
  useContext,
  createEffect,
  onCleanup
} from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { Unsubscribe } from 'firebase/firestore';
import { ProfileDocument } from '@shared/types';
import { useUserCtx } from './user.context';
import { profileService } from './profile.service';
import { notificationService } from '@hope-ui/solid';

type ProfileState = {
  profile: ProfileDocument | null;
  isLoading: boolean;
  error: Error | null;
};

type ProfileStateOps = {
  setProfile: (profile?: ProfileDocument | null, error?: Error | null) => void;
  refetchProfile: () => Promise<any>;
};

type IUserProfileCtx = [ProfileState, ProfileStateOps];

export const UserProfileCtx = createContext<IUserProfileCtx>();
export const useUserProfileCtx = () =>
  useContext(UserProfileCtx) as IUserProfileCtx;

export function UserProfileContextProvider(props: ParentProps) {
  const [userctx] = useUserCtx();
  const [state, setState] = createStore<ProfileState>({
    profile: null,
    isLoading: false,
    error: null
  });

  let unsub: Unsubscribe;

  const setProfile = (
    profile?: ProfileDocument | null,
    error?: Error | null
  ) => {
    setState(
      produce((s) => {
        s.isLoading = false;
        s.error = error ?? null;
        s.profile = profile ?? null;
      })
    );
  };

  const refetchProfile = async () => {
    if (!userctx.user) return;

    setState('isLoading', true);

    try {
      const db = await profileService.db();
      const p = await db.findById(userctx.user.uid);

      setProfile(p, null);
    } catch (err) {
      setProfile(null, err.message);
    }
  };

  createEffect(() => {
    setState('isLoading', true);

    async function waitForProfile() {
      if (userctx.user) {
        const db = await profileService.db();
        unsub = db.$findById(
          userctx.user.uid,
          (profile) => {
            if (profile) {
              unsub();
              notificationService.hide('new-profile');
            }

            setProfile(profile);
          },
          (err) => {
            setProfile(null, err);
          }
        );
      }
    }

    waitForProfile();
  });

  createEffect(() => {
    if (userctx.isSignedOut) {
      setProfile(null);
      unsub && unsub();
    }
  });

  onCleanup(() => {
    unsub && unsub();
  });

  const ctx: IUserProfileCtx = [state, { setProfile, refetchProfile }];

  return (
    <UserProfileCtx.Provider value={ctx}>
      {props.children}
    </UserProfileCtx.Provider>
  );
}
