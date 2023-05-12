import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Skeleton
} from '@hope-ui/solid';
import { For, createSignal, lazy, createEffect, on } from 'solid-js';
import { A, Outlet, useLocation } from '@solidjs/router';
import { useUserProfileCtx } from '../../lib/user/user-profile.context';
import { fadeInCss } from '../../lib/stitches.utils';
import { ROUTE_PATH } from '../../routes';
import { useRedirectIfSignedOut } from '../../lib/user/user.context';
import { useI18n } from '../../i18n.context';
import ColorModeToggle from '../../components/ColorModeToggle';
import { BirthdaysProvider } from '../../lib/birthday/birthdays.context';
import { NotificationChannelsProvider } from '../../lib/notificationChannel/notificationChannels.context';

const FinishProfileModal = lazy(
  () => import('../../components/FinishProfileModal')
);

const Header = () => {
  const [profilectx] = useUserProfileCtx();

  return (
    <Box textAlign="center" position="relative">
      <Skeleton
        width="175px"
        maxWidth="100%"
        margin="auto"
        loaded={!!profilectx.profile}
      >
        <Heading my="0" size="lg" level="1" css={fadeInCss()}>
          {profilectx?.profile?.displayName ?? 'Loading'}
        </Heading>
      </Skeleton>

      <Box position="absolute" right={0} top={0}>
        <ColorModeToggle id="color-toggle" />
      </Box>
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
  useRedirectIfSignedOut();

  return (
    <Container
      px="$3"
      pt="$3"
      pb={{ '@initial': '$10', '@md': '$40' }}
      maxWidth={{ '@lg': 750 }}
    >
      <Box mb="$6">
        <Header />
      </Box>
      <Navs />
      <Divider my="$4" />

      <BirthdaysProvider>
        <NotificationChannelsProvider>
          <Outlet />
        </NotificationChannelsProvider>
      </BirthdaysProvider>

      <FinishProfileModal />
    </Container>
  );
}
