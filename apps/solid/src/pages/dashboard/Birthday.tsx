import { Box, Button } from '@hope-ui/solid';
import { Component, Show, Match, Switch, lazy, Suspense } from 'solid-js';
import { A } from '@solidjs/router';
import { useCheatCodes } from '../../lib/useCheatCodes';
import PageTitle from '../../components/PageTitle';
import ViewPicker, { useView } from '../../components/ViewPicker';
import { ROUTE_PATH } from '../../routes';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';

const BirthdayCalendar = lazy(
  () => import('../../components/birthday/calendar/BirthdayCalendar')
);
const BirthdayList = lazy(
  () => import('../../components/birthday/list/BirthdayList')
);

const DashBirthday: Component = () => {
  useCheatCodes();

  const [birthdayList] = useBirthdaysCtx();
  const [view, setView] = useView();

  return (
    <div>
      <PageTitle>Birthday List</PageTitle>

      <Box display="flex" justifyContent="space-between" mb="$10">
        <Button as={A} variant="ghost" href={ROUTE_PATH.addBirthday}>
          Add birthday
        </Button>
        <ViewPicker value={view()} onChange={setView} />
      </Box>

      <Suspense>
        <Show when={birthdayList.latest}>
          <Switch>
            <Match when={view() === 'calendar'}>
              <Box>
                <BirthdayCalendar birthdays={birthdayList.latest!} />
              </Box>
            </Match>
            <Match when={view() === 'list'}>
              <BirthdayList birthdays={birthdayList.latest!} />
            </Match>
          </Switch>
        </Show>
      </Suspense>
    </div>
  );
};

export default DashBirthday;
