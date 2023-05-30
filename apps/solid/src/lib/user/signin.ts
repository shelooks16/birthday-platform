import { useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { userService } from './user.service';
import { useUserCtx } from './user.context';
import { ROUTE_PATH } from '../../routes';
import type { UserCredential } from 'firebase/auth';
import { notificationService } from '@hope-ui/solid';
import { useI18n } from '../../i18n.context';

export const useGoogleSignin = (redirectLocation = ROUTE_PATH.birthday) => {
  const [i18n] = useI18n();
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
    try {
      const result = await userService.getRedirectResult();
      await updateStateAndRedirect(result);
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: i18n().t('signin.googleLogin.error', { message: err.message })
      });
    }
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
          title: i18n().t('signin.googleLogin.error', { message: err.message })
        });
      }

      setIsLoading(false);
    },
    isSigningInWithGoogle: isLoading
  };
};

export const useSignOut = (redirectLocation = ROUTE_PATH.index) => {
  const [i18n] = useI18n();
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
          title: i18n().t('signin.signout.success')
        });
      } catch (err) {
        notificationService.show({
          status: 'danger',
          title: i18n().t('signin.signout.error', { message: err.message })
        });
      }

      setIsLoading(false);
    },
    isSigningOut: isLoading
  };
};
