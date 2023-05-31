import {
  Component,
  For,
  createMemo,
  Show,
  Switch,
  Match,
  createSignal
} from 'solid-js';
import {
  Box,
  Heading,
  VStack,
  Skeleton,
  notificationService,
  IconButton,
  Button,
  Alert
} from '@hope-ui/solid';
import { IconArrowLeft, IconTimes } from '../Icons';
import { fadeInCss } from '../../lib/stitches.utils';
import AddEmailChannelBtn from './email/AddEmailChannelBtn';
import ConnectTelegramBotBtn from './telegram/ConnectTelegramBotBtn';
import { useNotificationChannelsCtx } from '../../lib/notificationChannel/notificationChannels.context';
import { getNotificationChannelTypes } from '@shared/static-cms';
import {
  ChannelType,
  ConfirmEmailOtpResult,
  NotificationChannelDocument
} from '@shared/types';
import { notificationChannelService } from '../../lib/notificationChannel/notificationChannel.service';
import AddEmailForm from './email/AddEmailForm';
import { useI18n } from '../../i18n.context';
import IconChannelType from '../notification/IconChannelType';
import { useBirthdaysCtx } from '../../lib/birthday/birthdays.context';

const ChannelItem: Component<{ channel: NotificationChannelDocument }> = (
  props
) => {
  const [i18n] = useI18n();
  const [, { mutate: mutateChannels }] = useNotificationChannelsCtx();
  const [birthdaysCtx, { refetch: refetchBirthdays }] = useBirthdaysCtx();
  const [isLoading, setIsLoading] = createSignal(false);

  const handleRemoveChannel = async () => {
    if (
      !window.confirm(
        i18n().t('notificationChannel.remove.confirmation', {
          channel: props.channel.displayName
        })
      )
    ) {
      return;
    }

    const channelId = props.channel.id;

    setIsLoading(true);

    try {
      await notificationChannelService.deleteById(channelId);

      notificationService.show({
        status: 'success',
        title: i18n().t('notificationChannel.remove.success', {
          channel: props.channel.displayName
        })
      });

      mutateChannels((channels) =>
        channels ? channels.filter((c) => c.id !== channelId) : channels
      );

      if (
        !birthdaysCtx.error &&
        birthdaysCtx.latest?.some((b) =>
          b.notificationSettings?.notifyChannelsIds.includes(channelId)
        )
      ) {
        // *think* listen for server updates with realtime listener
        setTimeout(() => {
          refetchBirthdays();
        }, 2500);
      }
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: i18n().t('notificationChannel.remove.error', {
          message: err.message
        })
      });
    }

    setIsLoading(false);
  };

  return (
    <Box
      color="$neutral10"
      fontWeight="$medium"
      display="flex"
      alignItems="center"
    >
      <IconButton
        size="xs"
        mr="$2"
        aria-label={i18n().t('notificationChannel.remove.btn', {
          channel: props.channel.displayName
        })}
        title={i18n().t('notificationChannel.remove.btn', {
          channel: props.channel.displayName
        })}
        colorScheme="neutral"
        variant="ghost"
        icon={<IconTimes fontSize="14px" color="$neutral10" />}
        onClick={handleRemoveChannel}
        loading={isLoading()}
      />
      <Box overflow="auto">{props.channel.displayName}</Box>
    </Box>
  );
};

export const ChannelListSkeleton: Component = () => {
  return (
    <VStack alignItems="stretch" spacing="$1" width="250px" maxW="100%">
      <Skeleton>
        <Box>Loading</Box>
      </Skeleton>
      <Skeleton>
        <Box>Loading</Box>
      </Skeleton>
    </VStack>
  );
};

type EditNotificationChannelsProps = {
  isInModal?: boolean;
};

const EditNotificationChannels: Component<EditNotificationChannelsProps> = (
  props
) => {
  const [i18n] = useI18n();
  const [channelsCtx] = useNotificationChannelsCtx();
  const [currentScreen, setCurrentScreen] = createSignal<ChannelType | null>(
    null
  );

  const channelGroups = createMemo(() => {
    const groups = getNotificationChannelTypes().reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as Record<string, NotificationChannelDocument[]>
    );

    if (channelsCtx.error || !channelsCtx.latest?.length) return groups;

    channelsCtx.latest.forEach((channel) => {
      groups[channel.type].push(channel);
    });

    return groups;
  });

  const handleEmailVerified = async (data: ConfirmEmailOtpResult) => {
    setCurrentScreen(null);

    notificationService.show({
      status: 'success',
      title: i18n().t('notificationChannel.email.addNew.success', {
        email: data.channel.value
      })
    });
  };

  return (
    <Show
      when={!currentScreen()}
      fallback={
        <Box>
          <Box mb="$4">
            <Button
              onClick={() => setCurrentScreen(null)}
              leftIcon={<IconArrowLeft fontSize="$lg" />}
              size="sm"
              variant="outline"
              colorScheme="neutral"
            >
              {i18n().t('notificationChannel.backToAllBtn')}
            </Button>
          </Box>
          <Switch>
            <Match when={currentScreen() === ChannelType.email}>
              <AddEmailForm onAfterSubmit={handleEmailVerified} />
            </Match>
          </Switch>
        </Box>
      }
    >
      <VStack gap="$6" alignItems="stretch">
        <For each={Object.keys(channelGroups())}>
          {(channelType) => (
            <Box>
              <Heading display="flex" alignItems="center" mb="$1">
                <IconChannelType
                  channelType={channelType as ChannelType}
                  color="$neutral10"
                  mr="$2"
                />
                {i18n().t(
                  `common.notificationChannel.labels.${channelType}` as any,
                  {},
                  channelType
                )}
              </Heading>

              <Switch fallback={<ChannelListSkeleton />}>
                <Match when={channelsCtx.error}>
                  <Alert status="danger">{channelsCtx.error.message}</Alert>
                </Match>
                <Match when={channelsCtx.latest}>
                  <Show
                    when={channelGroups()[channelType].length > 0}
                    fallback={
                      <div>{i18n().t('notificationChannel.noItemsAdded')}</div>
                    }
                  >
                    <VStack alignItems="stretch" spacing="$2" css={fadeInCss()}>
                      <For each={channelGroups()[channelType]}>
                        {(channel) => <ChannelItem channel={channel} />}
                      </For>
                    </VStack>
                  </Show>

                  <Box mt="$4">
                    <Switch>
                      <Match when={channelType === ChannelType.email}>
                        {props.isInModal ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentScreen(ChannelType.email)}
                          >
                            {i18n().t('notificationChannel.email.addNew.btn')}
                          </Button>
                        ) : (
                          <AddEmailChannelBtn variant="outline" size="sm" />
                        )}
                      </Match>
                      <Match when={channelType === ChannelType.telegram}>
                        <ConnectTelegramBotBtn variant="outline" size="sm" />
                      </Match>
                    </Switch>
                  </Box>
                </Match>
              </Switch>
            </Box>
          )}
        </For>
      </VStack>
    </Show>
  );
};

export default EditNotificationChannels;
