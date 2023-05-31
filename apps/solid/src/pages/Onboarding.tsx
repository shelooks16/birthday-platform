import { Box, Container, Heading, Center } from '@hope-ui/solid';
import { useNavigate } from '@solidjs/router';
import { Component, Match, Switch } from 'solid-js';
import ErrorMessage from '../components/error/ErrorMessage';
import LogoLoader from '../components/LogoLoader';
import ProfileForm from '../components/profile/ProfileForm';
import SignOutBtn from '../components/signin/SignOutBtn';
import { useI18n } from '../i18n.context';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { useRedirectIfSignedOut } from '../lib/user/user.context';
import { ROUTE_PATH } from '../routes';

const Onboarding: Component = () => {
  useRedirectIfSignedOut();

  const [i18n] = useI18n();
  const [profileCtx] = useUserProfileCtx();
  const navigate = useNavigate();

  const handleFinishOnboarding = async () => {
    navigate(ROUTE_PATH.birthday);
  };

  return (
    <Container py="$10">
      <Heading textAlign="center" size="xl" mb="$8">
        {i18n().t('profile.onboarding.title')}
      </Heading>

      <Switch>
        <Match when={profileCtx.isLoading}>
          <Center pt="10%">
            <LogoLoader />
          </Center>
        </Match>
        <Match when={profileCtx.error}>
          <ErrorMessage action="refresh">
            {profileCtx.error?.message}
          </ErrorMessage>
        </Match>
        <Match when={profileCtx.profile}>
          <ProfileForm onAfterSubmit={handleFinishOnboarding} />

          <Box textAlign="center" mt="$24">
            <SignOutBtn colorScheme="danger" variant="ghost" />
          </Box>
        </Match>
      </Switch>
    </Container>
  );
};

export default Onboarding;
