import { Box, Heading, HStack, SimpleGrid } from '@hope-ui/solid';
import { groupBy } from '@shared/general-utils';
import { Component, For, createMemo, Show } from 'solid-js';
import { useI18n } from '../../i18n.context';
import { NotificationDocumentWithRelations } from '../../lib/notification/useNotificationList';
import { IconUserCircle } from '../Icons';
import IconChannelType from './IconChannelType';
import EditBirthdayBtn from '../birthday/EditBirthdayBtn';

type NotificationListProps = {
  notifications: NotificationDocumentWithRelations[];
};

const NotificationList: Component<NotificationListProps> = (props) => {
  const [i18n] = useI18n();

  const monthYearToList = createMemo(() => {
    return groupBy(props.notifications, (item) =>
      i18n().format.dateToMonthYear(
        new Date(item.notifyAt),
        item._sourceBirthday?.notificationSettings?.timeZone ?? ''
      )
    );
  });

  return (
    <For each={Object.keys(monthYearToList())}>
      {(monthYear) => (
        <Box mb="$8">
          <Heading as="h3" size="lg" mb="$2">
            {monthYear}
          </Heading>

          <For each={monthYearToList()[monthYear]}>
            {(notification) => (
              <SimpleGrid
                columns={{ '@initial': 1, '@sm': 3 }}
                columnGap="$2"
                rowGap="$1"
                pt={{ '@initial': '$3', '@sm': '$1' }}
                mb={{ '@initial': '$3', '@sm': '$1' }}
                css={{
                  '& + &': {
                    borderTop: '1px solid $neutral4'
                  }
                }}
              >
                <Box>
                  {i18n().format.dateToDayMonthTime(
                    new Date(notification.notifyAt),
                    notification._sourceBirthday?.notificationSettings?.timeZone
                  )}
                </Box>
                <Box textAlign={{ '@initial': 'left', '@sm': 'center' }}>
                  <Box textAlign="left" w="25%" d="inline-block">
                    <HStack gap="$2">
                      <Show when={notification._notificationChannel}>
                        <IconChannelType
                          channelType={notification._notificationChannel!.type}
                          color="$neutral10"
                          fontSize="$sm"
                        />
                      </Show>
                      {notification._notificationChannel?.displayName ?? '-'}
                    </HStack>
                  </Box>
                </Box>
                <Box textAlign={{ '@initial': 'left', '@sm': 'right' }}>
                  <HStack gap="$2" d="inline-flex" pr="$1">
                    <IconUserCircle
                      color="$neutral10"
                      fontSize="$sm"
                      d={{ '@initial': 'block', '@sm': 'none' }}
                    />
                    <Box>{notification._sourceBirthday?.buddyName ?? '-'}</Box>
                    <Show when={notification._sourceBirthday}>
                      <EditBirthdayBtn
                        birthday={notification._sourceBirthday!}
                      />
                    </Show>
                  </HStack>
                </Box>
              </SimpleGrid>
            )}
          </For>
        </Box>
      )}
    </For>
  );
};

export default NotificationList;
