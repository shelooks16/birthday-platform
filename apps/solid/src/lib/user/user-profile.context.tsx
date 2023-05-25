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
import { useNavigate } from '@solidjs/router';
import { ROUTE_PATH } from '../../routes';
import { useI18n } from '../../i18n.context';
import { appConfig } from '../../appConfig';

type ProfileState = {
  profile: ProfileDocument | null;
  isLoading: boolean;
  error: Error | null;
};

type ProfileStateOps = {
  setProfile: (profile?: ProfileDocument | null, error?: Error | null) => void;
};

type IUserProfileCtx = [ProfileState, ProfileStateOps];

export const UserProfileCtx = createContext<IUserProfileCtx>();
export const useUserProfileCtx = () =>
  useContext(UserProfileCtx) as IUserProfileCtx;

export const useRedirectIfOnboardingNotFinished = () => {
  const profileCtxReturn = useUserProfileCtx();
  const [profileCtx] = profileCtxReturn;

  const navigate = useNavigate();

  createEffect(() => {
    if (
      !profileCtx.error &&
      profileCtx.profile &&
      !profileService.isProfileCompleted(profileCtx.profile)
    ) {
      navigate(ROUTE_PATH.onboarding);
    }
  });

  return profileCtxReturn;
};

export function UserProfileContextProvider(props: ParentProps) {
  const [userctx] = useUserCtx();
  const [, { locale }] = useI18n();
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

  createEffect(() => {
    setState('isLoading', true);

    async function waitForProfile() {
      if (userctx.user) {
        unsub = await profileService.$getMyProfile(
          (profile) => {
            if (profile) {
              unsub();
              notificationService.hide('new-profile');
              if (appConfig.isLanguageSupported(profile.locale)) {
                locale(profile.locale);
              }
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

  const ctx: IUserProfileCtx = [state, { setProfile }];

  return (
    <UserProfileCtx.Provider value={ctx}>
      {props.children}
    </UserProfileCtx.Provider>
  );
}
