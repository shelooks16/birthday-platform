import { Component, For, Show, ParentComponent } from 'solid-js';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Skeleton,
  Stack,
  VStack,
  VStackOptions
} from '@hope-ui/solid';
import { useSignOut } from '../../lib/user/signin';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';
import PageTitle from '../../components/PageTitle';
import LanguagePicker from '../../components/LanguagePicker';
import EditNotificationChannels from '../../components/notificationChannel/EditNotificationChannels';
import ExportBirthdaysBtn from '../../components/ExportBirthdaysBtn';

const Section: ParentComponent<{ title: string }> = (props) => {
  return (
    <Box
      css={{
        '& + &': {
          marginTop: '$6'
        }
      }}
    >
      <Heading mb="$2">{props.title}</Heading>
      <Box ml="$4">{props.children}</Box>
    </Box>
  );
};

const LoadingSkeleton: Component<{
  num: number;
  spacing: VStackOptions['spacing'];
}> = (props) => {
  return (
    <VStack alignItems="stretch" spacing={props.spacing}>
      <For each={Array(props.num).fill(null)}>
        {() => (
          <Skeleton>
            <Box>Loading</Box>
          </Skeleton>
        )}
      </For>
    </VStack>
  );
};

const makePublicUrl = (profileId: string) =>
  location.origin + '/profile/' + profileId;

const DashProfile: Component = () => {
  const [profilectx] = useUserProfileCtx();
  const signOut = useSignOut();

  return (
    <div>
      <PageTitle>My profile</PageTitle>

      <Section title="Notification channels">
        <EditNotificationChannels />
      </Section>

      <Section title="Settings">
        <VStack alignItems="start" gap="$4">
          <FormControl>
            <FormLabel for="lang-picker-trigger">Display language</FormLabel>
            <LanguagePicker id="lang-picker" />
          </FormControl>

          <Show
            when={profilectx.profile}
            fallback={<LoadingSkeleton num={2} spacing="$2" />}
          >
            <FormControl>
              <Box>
                <Checkbox>Public profile</Checkbox>
              </Box>
              <FormHelperText>
                Your public URL is {makePublicUrl('1245')}
              </FormHelperText>
            </FormControl>
          </Show>
        </VStack>
      </Section>

      <Section title="Import/Export">
        <Stack justifyContent="start">
          <ExportBirthdaysBtn />
        </Stack>
      </Section>

      <Box textAlign="center" mt="$24">
        <Button
          onClick={signOut}
          type="button"
          colorScheme="danger"
          variant="ghost"
        >
          Sign out
        </Button>
      </Box>
    </div>
  );
};

export default DashProfile;
