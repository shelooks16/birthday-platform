import { Component, ParentComponent, Show } from 'solid-js';
import { Box, Heading, Stack } from '@hope-ui/solid';
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
import { usePreviewModeCtx } from '../../lib/previewMode/preview-mode.context';
import ExitPreviewModeBtn from '../../components/previewMode/ExitPreviewModeBtn';

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
  const [isPreviewMode] = usePreviewModeCtx();
  const [i18n] = useI18n();

  return (
    <div>
      <PageTitle>{i18n().t('pages.profile.title')}</PageTitle>

      <Section title={i18n().t('notificationChannel.title')}>
        <EditNotificationChannels />
      </Section>

      <Section title={i18n().t('profile.settingsZone.title')}>
        <ProfileForm />
      </Section>

      <Section title={i18n().t('birthday.importExportSection.title')}>
        <Stack
          direction={{ '@initial': 'column', '@sm': 'row' }}
          spacing="$2"
          width="100%"
        >
          <ExportBirthdaysBtn variant="outline" flex={{ '@sm': 1 }} />
          <ImportBirthdaysBtn variant="outline" flex={{ '@sm': 1 }} />
        </Stack>
      </Section>

      <Section title={i18n().t('profile.dangerZone.title')}>
        <DeleteMyProfileBtn w="100%" colorScheme="danger" variant="outline" />
      </Section>

      <Box textAlign="center" mt="$24">
        <Show
          when={!isPreviewMode()}
          fallback={<ExitPreviewModeBtn colorScheme="danger" variant="ghost" />}
        >
          <SignOutBtn colorScheme="danger" variant="ghost" />
        </Show>

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
