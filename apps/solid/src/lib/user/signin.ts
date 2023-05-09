import { useNavigate } from '@solidjs/router';
import { onMount } from 'solid-js';
import { userService } from './user.service';
import { useUserCtx } from './user.context';
import { ROUTE_PATH } from '../../routes';
import type { UserCredential } from 'firebase/auth';
import { notificationService } from '@hope-ui/solid';

export const useGoogleSignin = (redirectLocation = ROUTE_PATH.birthday) => {
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  const updateStateAndRedirect = async (credential: UserCredential | null) => {
    if (credential) {
      setUser(credential.user);
      navigate(redirectLocation);

      const info = await userService.getAdditionalUserInfo(credential);

      if (info?.isNewUser) {
        notificationService.show({
          id: 'new-profile',
          status: 'info',
          title: 'Creating user profile...',
          loading: true,
          persistent: true
        });
      }
    }
  };

  onMount(async () => {
    const result = await userService.getRedirectResult();
    updateStateAndRedirect(result);
  });

  return async () => {
    const credential = await userService.signinWithGoogle();
    updateStateAndRedirect(credential);
  };
};

export const useSignOut = (redirectLocation = ROUTE_PATH.index) => {
  const [, { setUser }] = useUserCtx();
  const navigate = useNavigate();

  return async () => {
    await userService.signOut();
    setUser();
    navigate(redirectLocation);

    notificationService.show({
      status: 'success',
      title: 'Signed out',
      duration: 3000
    });
  };
};
