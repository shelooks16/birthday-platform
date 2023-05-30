import { Box, Button, Divider, Heading, Text, VStack } from '@hope-ui/solid';
import { A } from '@solidjs/router';
import { Component, Match, Show, Switch } from 'solid-js';
import { appConfig } from '../appConfig';
import EnterPreviewModeFloatingBar from '../components/previewMode/EnterPreviewModeFloatingBar';
import ExitPreviewModeBtn from '../components/previewMode/ExitPreviewModeBtn';
import GoogleSignInBtn from '../components/signin/GoogleSignInBtn';
import SignOutBtn from '../components/signin/SignOutBtn';
import { useI18n } from '../i18n.context';
import { usePreviewModeCtx } from '../lib/previewMode/preview-mode.context';
import { fadeInCss } from '../lib/stitches.utils';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { useUserCtx } from '../lib/user/user.context';
import { ROUTE_PATH } from '../routes';

const Home: Component = () => {
  const [i18n] = useI18n();
  const [isPreviewMode] = usePreviewModeCtx();
  const [usrCtx] = useUserCtx();
  const [profileCtx] = useUserProfileCtx();

  return (
    <Box>
      <EnterPreviewModeFloatingBar />

      <Box textAlign="center" pt="12%">
        <Heading as="h1" size="4xl" mb="$1" color="$neutral12">
          {appConfig.platformName}
        </Heading>
        <Text color="$neutral11">{i18n().t('home.motto')}</Text>
      </Box>

      <Divider mt="$8" mb="$4" />

      <Box mb="$6">{i18n().t('home.textAbout')}</Box>

      <VStack
        w="400px"
        mx="auto"
        maxW="100%"
        alignItems="stretch"
        spacing="$2"
        css={fadeInCss()}
      >
        <Switch>
          <Match when={usrCtx.isLoading}>{/* <Box>...</Box> */}</Match>
          <Match when={usrCtx.isSignedOut}>
            <GoogleSignInBtn colorScheme="primary" variant="solid" />
          </Match>
          <Match when={usrCtx.user}>
            <Button
              as={A}
              href={ROUTE_PATH.birthday}
              loading={!profileCtx.error && !profileCtx.profile}
            >
              {i18n().t('signin.alreadyLoggedInBtn', {
                name: !profileCtx.error ? profileCtx.profile?.displayName : '-'
              })}
            </Button>
            <Show
              when={!isPreviewMode()}
              fallback={
                <ExitPreviewModeBtn colorScheme="danger" variant="ghost" />
              }
            >
              <SignOutBtn colorScheme="danger" variant="ghost" />
            </Show>
          </Match>
        </Switch>
      </VStack>
    </Box>
  );
};

export default Home;
