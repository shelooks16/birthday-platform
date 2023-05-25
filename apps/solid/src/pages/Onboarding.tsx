import {
  Box,
  Button,
  Container,
  Heading,
  notificationService
} from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Component, Match, Switch } from 'solid-js';
import ProfileForm from '../components/profile/ProfileForm';
import { useSignOut } from '../lib/user/signin';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { useRedirectIfSignedOut } from '../lib/user/user.context';
import { ROUTE_PATH } from '../routes';

const Onboarding: Component = () => {
  useRedirectIfSignedOut();

  const [profileCtx] = useUserProfileCtx();
  const { signOut, isSigningOut } = useSignOut();
  const navigate = useNavigate();

  const handleFinishOnboarding = async () => {
    notificationService.show({
      status: 'success',
      title: 'Information saved'
    });
    navigate(ROUTE_PATH.birthday);
  };

  return (
    <Container px="$3" py="$10" maxWidth={{ '@lg': 750 }}>
      <Heading textAlign="center" size="xl" mb="$8">
        Finish your profile before we can start
      </Heading>

      <Switch>
        <Match when={profileCtx.isLoading}>
          <div>...</div>
        </Match>
        <Match when={profileCtx.error}>
          <div>{profileCtx.error!.message}</div>
        </Match>
        <Match when={profileCtx.profile}>
          <ProfileForm onAfterSubmit={handleFinishOnboarding} />

          <Box textAlign="center" mt="$24">
            <Button
              onClick={signOut}
              loading={isSigningOut()}
              type="button"
              colorScheme="danger"
              variant="ghost"
            >
              Sign out
            </Button>
          </Box>
        </Match>
      </Switch>
    </Container>
  );
};

export default Onboarding;
