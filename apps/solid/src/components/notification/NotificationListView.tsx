import {
  Box,
  Heading,
  HStack,
  SimpleOption,
  SimpleSelect,
  Spinner,
  Stack
} from '@hope-ui/solid';
import {
  Component,
  For,
  createSignal,
  createEffect,
  onCleanup,
  Switch,
  Match,
  Show
} from 'solid-js';
import { useI18n } from '../../i18n.context';
import {
  NotificationsFilter,
  useNotificationList
} from '../../lib/notification/useNotificationList';
import { fadeInCss } from '../../lib/stitches.utils';
import ErrorMessage from '../error/ErrorMessage';
import NotificationList from './NotificationList';

const NotificationListView: Component = () => {
  const [i18n] = useI18n();
  const [filter, setFilter] = createSignal<NotificationsFilter>({
    orderByNotifyAt: 'asc'
  });
  const [list, listResource, { refetch: refetchList }] =
    useNotificationList(filter);
  const [isApplyingFilter, setIsApplyingFilter] = createSignal(false);

  let filterTimeout: number;

  createEffect(() => {
    if (listResource.loading) {
      setIsApplyingFilter(true);
    } else {
      filterTimeout = setTimeout(() => {
        setIsApplyingFilter(false);
      }, 300);
    }
  });

  onCleanup(() => clearTimeout(filterTimeout));

  const orderDirOptions = [
    {
      value: 'asc',
      label: i18n().t('birthday.notifications.createdAtSort.asc')
    },
    {
      value: 'desc',
      label: i18n().t('birthday.notifications.createdAtSort.desc')
    }
  ];

  return (
    <div>
      <Stack
        alignItems={{ '@initial': 'stretch', '@sm': 'center' }}
        justifyContent="space-between"
        mb="$5"
        css={fadeInCss()}
        spacing="$3"
        direction={{ '@initial': 'column', '@sm': 'row' }}
      >
        <HStack alignItems="center" spacing="$2" css={{ whiteSpace: 'nowrap' }}>
          <Heading as="h2" size="xl" color="$neutral11">
            {i18n().t('birthday.notifications.title')}
          </Heading>
          <Show when={isApplyingFilter()}>
            <Box>
              <Spinner size="xs" />
            </Box>
          </Show>
        </HStack>
        <Box>
          <SimpleSelect
            width="auto"
            id="order-dir"
            value={filter().orderByNotifyAt}
            onChange={(value) =>
              setFilter((p) => ({ ...p, orderByNotifyAt: value }))
            }
            disabled={!listResource.error && listResource.latest?.length === 0}
          >
            <For each={orderDirOptions}>
              {(option) => (
                <SimpleOption value={option.value}>{option.label}</SimpleOption>
              )}
            </For>
          </SimpleSelect>
        </Box>
      </Stack>

      <Switch>
        <Match when={listResource.error}>
          <ErrorMessage action={refetchList}>
            {listResource.error.message}
          </ErrorMessage>
        </Match>
        <Match when={list()}>
          <Box css={fadeInCss()}>
            <Show
              when={list()!.length > 0}
              fallback={
                <Box>
                  {i18n().t('birthday.notifications.noNotificationsFound')}
                </Box>
              }
            >
              <NotificationList notifications={list()!} />
            </Show>
          </Box>
        </Match>
      </Switch>
    </div>
  );
};

export default NotificationListView;
