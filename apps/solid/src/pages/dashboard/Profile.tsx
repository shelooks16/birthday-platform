import { Component, ParentComponent, Show } from 'solid-js';
import { Box, Heading, notificationService, Stack } from '@hope-ui/solid';
import PageTitle from '../../components/PageTitle';
import EditNotificationChannels from '../../components/notificationChannel/EditNotificationChannels';
import ExportBirthdaysBtn from '../../components/importExport/ExportBirthdaysBtn';
import ImportBirthdaysBtn from '../../components/importExport/ImportBirthdaysBtn';
import ProfileForm from '../../components/profile/ProfileForm';
import BuyMeACoffeeBtn from '../../lib/BuyMeACoffeeBtn';
import { appConfig } from '../../appConfig';
import DeleteMyProfileBtn from '../../components/profile/DeleteMyProfileBtn';
import SignOutBtn from '../../components/signin/SignOutBtn';
import { useI18n } from '../../i18n.context';

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
  const [i18n] = useI18n();

  const onProfileSaved = () => {
    notificationService.show({
      status: 'success',
      title: 'Information saved'
    });
  };

  return (
    <div>
      <PageTitle>{i18n().t('pages.profile.title')}</PageTitle>

      <Section title="Notification channels">
        <EditNotificationChannels />
      </Section>

      <Section title="Settings">
        <ProfileForm onAfterSubmit={onProfileSaved} />
      </Section>

      <Section title="Import/Export">
        <Stack
          direction={{ '@initial': 'column', '@sm': 'row' }}
          spacing="$2"
          width="100%"
        >
          <ExportBirthdaysBtn variant="outline" flex={{ '@sm': 1 }} />
          <ImportBirthdaysBtn variant="outline" flex={{ '@sm': 1 }} />
        </Stack>
      </Section>

      <Section title="Danger zone">
        <DeleteMyProfileBtn w="100%" colorScheme="danger" variant="outline">
          Delete my account
        </DeleteMyProfileBtn>
      </Section>

      <Box textAlign="center" mt="$24">
        <SignOutBtn colorScheme="danger" variant="ghost" />

        <Box mt="$10">
          <Box mt="$3">
            <Box>
              &copy; {new Date().getFullYear()} {appConfig.developerInfo.name}
            </Box>
            <Show when={appConfig.developerInfo.buyMeACoffe?.id}>
              <Box mt="$2">
                <BuyMeACoffeeBtn />
              </Box>
            </Show>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default DashProfile;
