import { Box, Button, Divider, Heading, Text, VStack } from '@hope-ui/solid';
import { A, useNavigate } from '@solidjs/router';
import { Component, Match, Show, Switch } from 'solid-js';
import { appConfig } from '../appConfig';
import ExitPreviewModeBtn from '../components/ExitPreviewModeBtn';
import GoogleSignInBtn from '../components/signin/GoogleSignInBtn';
import SignOutBtn from '../components/signin/SignOutBtn';
import { useI18n } from '../i18n.context';
import { usePreviewModeCtx } from '../lib/previewMode/preview-mode.context';
import { fadeInCss } from '../lib/stitches.utils';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { useUserCtx } from '../lib/user/user.context';
import { ROUTE_PATH } from '../routes';

const PreviewModeFloating = () => {
  const [i18n] = useI18n();
  const [, { enablePreviewMode }] = usePreviewModeCtx();
  const navigate = useNavigate();

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      width="100%"
      textAlign="center"
      py="$8"
      px="$3"
      bg="$background"
    >
      <Box mb="$2" fontSize="$sm" color="$neutral12">
        {i18n().t('previewMode.enterPreview.title')}
      </Box>
      <Button
        maxW="100%"
        variant="ghost"
        colorScheme="primary"
        onClick={() => {
          enablePreviewMode();
          navigate(ROUTE_PATH.birthday);
        }}
      >
        {i18n().t('previewMode.enterPreview.btn')}
      </Button>
    </Box>
  );
};

const Home: Component = () => {
  const [i18n] = useI18n();
  const [isPreviewMode] = usePreviewModeCtx();
  const [usrCtx] = useUserCtx();
  const [profileCtx] = useUserProfileCtx();

  return (
    <Box>
      <PreviewModeFloating />

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
              Continue as{' '}
              {!profileCtx.error ? profileCtx.profile?.displayName : '-'}
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
