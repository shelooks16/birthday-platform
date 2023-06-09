import { Box, Button } from '@hope-ui/solid';
import { Component, Show, Match, Switch, lazy, Suspense } from 'solid-js';
import { A } from '@solidjs/router';
import { useCheatCodes } from '../../lib/useCheatCodes';
import PageTitle from '../../components/PageTitle';
import ViewPicker, { useView } from '../../components/ViewPicker';
import { ROUTE_PATH } from '../../routes';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';
import NoBirthdaysText from '../../components/birthday/NoBirthdaysText';
import { useI18n } from '../../i18n.context';
import ErrorMessage from '../../components/error/ErrorMessage';

const BirthdayCalendar = lazy(
  () => import('../../components/birthday/calendar/BirthdayCalendar')
);
const BirthdayList = lazy(
  () => import('../../components/birthday/list/BirthdayList')
);
const NotificationListView = lazy(
  () => import('../../components/notification/NotificationListView')
);

const DashBirthday: Component = () => {
  const [i18n] = useI18n();
  useCheatCodes();

  const [birthdayList, { refetch: refetchBirthdays }] = useBirthdaysCtx();
  const [view, setView] = useView();

  return (
    <div>
      <PageTitle>{i18n().t('pages.birthday.title')}</PageTitle>

      <Box display="flex" justifyContent="space-between" mb="$10">
        <Button as={A} variant="ghost" href={ROUTE_PATH.addBirthday}>
          {i18n().t('birthday.addBirthday.btn')}
        </Button>
        <ViewPicker value={view()} onChange={setView} />
      </Box>

      <Suspense>
        <Switch>
          <Match when={birthdayList.error}>
            <ErrorMessage action={refetchBirthdays}>
              {birthdayList.error.message}
            </ErrorMessage>
          </Match>
          <Match when={birthdayList.latest}>
            <Switch>
              <Match when={view() === 'calendar'}>
                <Box position="relative">
                  <Box
                    css={
                      birthdayList.latest!.length === 0
                        ? {
                            opacity: 0.3,
                            filter: 'blur(4px)'
                          }
                        : undefined
                    }
                  >
                    <BirthdayCalendar birthdays={birthdayList.latest!} />
                  </Box>
                  <Show when={birthdayList.latest!.length === 0}>
                    <Box
                      position="absolute"
                      w="100%"
                      h="100%"
                      top="$10"
                      left="0"
                      bottom="0"
                      right="0"
                      d="flex"
                      justifyContent="center"
                    >
                      <NoBirthdaysText />
                    </Box>
                  </Show>
                </Box>
              </Match>
              <Match when={view() === 'list'}>
                <Show
                  when={birthdayList.latest!.length > 0}
                  fallback={<NoBirthdaysText />}
                >
                  <BirthdayList birthdays={birthdayList.latest!} />
                </Show>
              </Match>
              <Match when={view() === 'notifications'}>
                <Show
                  when={birthdayList.latest!.length > 0}
                  fallback={<NoBirthdaysText />}
                >
                  <NotificationListView />
                </Show>
              </Match>
            </Switch>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
};

export default DashBirthday;
