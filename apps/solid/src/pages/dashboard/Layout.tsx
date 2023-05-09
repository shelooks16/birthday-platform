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

type NavLink = {
  label: string;
  hrefKey: string;
};

const Navs = () => {
  const location = useLocation();
  const [i18n] = useI18n();

  const findNavLink = (navs: NavLink[], pathname: string) =>
    navs.find((item) => (ROUTE_PATH as any)[item.hrefKey] === pathname);

  const [activeNavLink, setActiveNavLink] = createSignal(
    findNavLink(i18n().t<NavLink[]>('dashboard.navs'), location.pathname)
  );

  const isActive = (navLink: NavLink) =>
    activeNavLink()?.hrefKey === navLink.hrefKey;

  createEffect(
    on(
      () => location.pathname,
      (activePathname) => {
        setActiveNavLink(
          findNavLink(i18n().t<NavLink[]>('dashboard.navs'), activePathname)
        );
      }
    )
  );

  return (
    <HStack gap="$1" justifyContent="center">
      <For each={i18n().t<NavLink[]>('dashboard.navs')}>
        {(item) => (
          <Button
            as={A}
            href={(ROUTE_PATH as any)[item.hrefKey]}
            fontWeight="$normal"
            variant={isActive(item) ? 'subtle' : 'ghost'}
            px={{ '@initial': '$2', '@sm': '$4' }}
            css={
              !isActive(item)
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
            {item.label}
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
