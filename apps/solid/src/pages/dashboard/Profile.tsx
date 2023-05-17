import { Component, ParentComponent } from 'solid-js';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  VStack
} from '@hope-ui/solid';
import { useSignOut } from '../../lib/user/signin';
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

const DashProfile: Component = () => {
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
