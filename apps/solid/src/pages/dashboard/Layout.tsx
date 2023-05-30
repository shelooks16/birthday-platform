import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack
} from '@hope-ui/solid';
import {
  For,
  createSignal,
  createEffect,
  on,
  Switch,
  Match,
  Show
} from 'solid-js';
import { A, Outlet, useLocation } from '@solidjs/router';
import {
  useRedirectIfOnboardingNotFinished,
  useUserProfileCtx
} from '../../lib/user/user-profile.context';
import { fadeInCss } from '../../lib/stitches.utils';
import { ROUTE_PATH } from '../../routes';
import { useRedirectIfSignedOut } from '../../lib/user/user.context';
import { useI18n } from '../../i18n.context';
import { BirthdaysProvider } from '../../lib/birthday/birthdays.context';
import { NotificationChannelsProvider } from '../../lib/notificationChannel/notificationChannels.context';
import LogoLoader from '../../components/LogoLoader';
import { usePreviewModeCtx } from '../../lib/previewMode/preview-mode.context';
import ExitPreviewModeBtn from '../../components/previewMode/ExitPreviewModeBtn';
import { TranslationKeyWeb } from '@shared/locales';

const Header = () => {
  const [profilectx] = useUserProfileCtx();

  return (
    <Box textAlign="center" position="relative">
      <Heading my="0" size="lg" level="1" px="$10" css={fadeInCss()}>
        {profilectx?.profile?.displayName ?? '-'}
      </Heading>
    </Box>
  );
};

const Navs = () => {
  const location = useLocation();
  const [i18n] = useI18n();

  const navsList: { href: string; i18nKey: TranslationKeyWeb }[] = [
    {
      href: ROUTE_PATH.birthday,
      i18nKey: 'dashboard.navs.birthday'
    },
    {
      href: ROUTE_PATH.profile,
      i18nKey: 'dashboard.navs.profile'
    }
  ];

  const [activeHref, setActiveHref] = createSignal<string | undefined>(
    navsList.find((nav) => nav.href === location.pathname)?.href
  );

  const isActive = (href: string) => activeHref() === href;

  createEffect(on(() => location.pathname, setActiveHref));

  return (
    <HStack gap="$1" justifyContent="center">
      <For each={navsList}>
        {(nav) => (
          <Button
            as={A}
            href={nav.href}
            fontWeight="$normal"
            variant={isActive(nav.href) ? 'subtle' : 'ghost'}
            px={{ '@initial': '$2', '@sm': '$4' }}
            css={
              !isActive(nav.href)
                ? {
                    color: '$neutral11',
                    _hover: {
                      bg: '$neutral3'
                    }
                  }
                : {
                    bg: '$primary3',
                    _hover: {
                      bg: '$primary4'
                    }
                  }
            }
          >
            {i18n().t(nav.i18nKey)}
          </Button>
        )}
      </For>
    </HStack>
  );
};

export default function DashboardLayout() {
  const [isPreviewMode] = usePreviewModeCtx();
  useRedirectIfSignedOut();
  const [profileCtx] = useRedirectIfOnboardingNotFinished();

  return (
    <Switch>
      <Match when={profileCtx.isLoading}>
        <Center pt="20%">
          <LogoLoader />
        </Center>
      </Match>
      <Match when={profileCtx.error}>
        <Alert status="danger" mt="$2">
          {profileCtx.error!.message}
        </Alert>
      </Match>
      <Match when={profileCtx.profile}>
        <Box mb="$6">
          <Header />
          <Show when={isPreviewMode()}>
            <Box textAlign="center" mt="$2">
              <ExitPreviewModeBtn colorScheme="danger" variant="ghost" />
            </Box>
          </Show>
        </Box>
        <Navs />
        <Divider my="$4" />

        <BirthdaysProvider>
          <NotificationChannelsProvider>
            <Outlet />
          </NotificationChannelsProvider>
        </BirthdaysProvider>
      </Match>
    </Switch>
  );
}
