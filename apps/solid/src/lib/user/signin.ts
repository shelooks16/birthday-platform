import { useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { userService } from './user.service';
import { useUserCtx } from './user.context';
import { ROUTE_PATH } from '../../routes';
import type { UserCredential } from 'firebase/auth';
import { notificationService } from '@hope-ui/solid';

export const useGoogleSignin = (redirectLocation = ROUTE_PATH.birthday) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  const updateStateAndRedirect = async (credential: UserCredential | null) => {
    if (credential) {
      setUser(credential.user);

      const info = await userService.getAdditionalUserInfo(credential);

      if (info?.isNewUser) {
        navigate(ROUTE_PATH.onboarding);
        notificationService.show({
          id: 'new-profile',
          status: 'info',
          title: 'Creating user profile...',
          loading: true,
          persistent: true
        });
      } else {
        navigate(redirectLocation);
      }
    }
  };

  onMount(async () => {
    const result = await userService.getRedirectResult();
    updateStateAndRedirect(result);
  });

  return {
    signInWithGoogle: async () => {
      setIsLoading(true);

      try {
        const credential = await userService.signinWithGoogle();
        await updateStateAndRedirect(credential);
      } catch (err) {
        notificationService.show({
          status: 'danger',
          title: `Sign in error: ${err.message}`
        });
      }

      setIsLoading(false);
    },
    isSigningInWithGoogle: isLoading
  };
};

export const useSignOut = (redirectLocation = ROUTE_PATH.index) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  return {
    signOut: async () => {
      setIsLoading(true);

      try {
        await userService.signOut();
        setUser();
        navigate(redirectLocation);

        notificationService.show({
          status: 'success',
          title: 'Signed out'
        });
      } catch (err) {
        notificationService.show({
          status: 'danger',
          title: `Failed to sign out: ${err.message}`
        });
      }

      setIsLoading(false);
    },
    isSigningOut: isLoading
  };
};
