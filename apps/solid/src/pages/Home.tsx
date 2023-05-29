import { Box, Button, Divider, Heading, Text, VStack } from '@hope-ui/solid';
import { A } from '@solidjs/router';
import { Component, Match, Switch } from 'solid-js';
import GoogleSignInBtn from '../components/signin/GoogleSignInBtn';
import SignOutBtn from '../components/signin/SignOutBtn';
import { fadeInCss } from '../lib/stitches.utils';
import { useUserProfileCtx } from '../lib/user/user-profile.context';
import { useUserCtx } from '../lib/user/user.context';
import { ROUTE_PATH } from '../routes';

const Home: Component = () => {
  const [usrCtx] = useUserCtx();
  const [profileCtx] = useUserProfileCtx();

  return (
    <Box>
      <Box textAlign="center" pt="12%">
        <Heading as="h1" size="4xl" mb="$1" color="$neutral12">
          Buddy Birthday
        </Heading>
        <Text color="$neutral11">Never skip birthdays of your buddies</Text>
      </Box>

      <Divider mt="$8" mb="$4" />

      <Box mb="$8">
        This platform is all-in-one tool to manage birthdays. View birthdays on
        calendar and canvas, receive birthday reminders through email and
        telegram, create unique birthday wishes using OpenAI.
      </Box>

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
            <SignOutBtn colorScheme="danger" variant="ghost" />
          </Match>
        </Switch>
      </VStack>
    </Box>
  );
};

export default Home;
