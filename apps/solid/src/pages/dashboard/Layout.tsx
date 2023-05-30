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

const Header = () => {
  const [profilectx] = useUserProfileCtx();

  return (
    <Box textAlign="center" position="relative">
      <Heading my="0" size="lg" level="1" px="$10" css={fadeInCss()}>
        {profilectx?.profile?.displayName ?? 'Loading'}
      </Heading>
    </Box>
  );
};

const navsList = [ROUTE_PATH.birthday, ROUTE_PATH.profile];

const Navs = () => {
  const location = useLocation();
  const [i18n] = useI18n();

  const [activeHref, setActiveHref] = createSignal<string | undefined>(
    navsList.find((href) => href === location.pathname)
  );

  const isActive = (href: string) => activeHref() === href;
  const getKeyOfHref = (href: string) =>
    Object.keys(ROUTE_PATH).find((key) => (ROUTE_PATH as any)[key] === href);

  createEffect(on(() => location.pathname, setActiveHref));

  return (
    <HStack gap="$1" justifyContent="center">
      <For each={navsList}>
        {(href) => (
          <Button
            as={A}
            href={href}
            fontWeight="$normal"
            variant={isActive(href) ? 'subtle' : 'ghost'}
            px={{ '@initial': '$2', '@sm': '$4' }}
            css={
              !isActive(href)
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
            {i18n()
              .t<{ hrefKey: string; label: string }[]>('dashboard.navs', {}, [])
              .find((tt) => getKeyOfHref(href) === tt.hrefKey)?.label ?? href}
          </Button>
        )}
      </For>
    </HStack>
  );
};

export default function DashboardLayout() {
  const [isPreviewMode, { disablePreviewMode }] = usePreviewModeCtx();
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
              <Button
                colorScheme="danger"
                variant="ghost"
                onClick={disablePreviewMode}
              >
                Click to exit demo
              </Button>
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
