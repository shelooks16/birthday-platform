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
  Button
} from '@hope-ui/solid';
import { IconArrowLeft, IconEmail, IconTimes } from '../Icons';
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

const ChannelItem: Component<{ channel: NotificationChannelDocument }> = (
  props
) => {
  const [, { mutate }] = useNotificationChannelsCtx();
  const [isLoading, setIsLoading] = createSignal(false);

  const handleRemoveChannel = async () => {
    if (
      !window.confirm(
        `All notifications which must be delivered to ${props.channel.displayName} will be cancelled. Are you sure?`
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const db = await notificationChannelService.db();

      await db.deleteById(props.channel.id);

      notificationService.show({
        status: 'success',
        title: `Removed ${props.channel.displayName}`
      });

      const channelId = props.channel.id;
      mutate((channels) =>
        channels ? channels.filter((c) => c.id !== channelId) : channels
      );
    } catch (err) {
      notificationService.show({
        status: 'danger',
        title: `Error removing channel. ${err.message}`
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
        aria-label="Remove"
        title="Remove"
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
    <VStack alignItems="stretch" spacing="$2">
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
      title: 'Email verified',
      description: `Added ${data.channel.value}`
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
              Back to list
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
                <IconEmail color="$neutral10" mr="$2" />{' '}
                {i18n().t(
                  `notificationChannel.labels.${channelType}` as any,
                  {},
                  channelType
                )}
              </Heading>

              <Switch fallback={<ChannelListSkeleton />}>
                <Match when={channelsCtx.error}>
                  <Box>{channelsCtx.error.message}</Box>
                </Match>
                <Match when={channelsCtx.latest}>
                  <Show
                    when={channelGroups()[channelType].length > 0}
                    fallback={<div>Nothing added</div>}
                  >
                    <VStack alignItems="stretch" spacing="$2" css={fadeInCss()}>
                      <For each={channelGroups()[channelType]}>
                        {(channel) => <ChannelItem channel={channel} />}
                      </For>
                    </VStack>
                  </Show>
                </Match>
              </Switch>

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
                        Add email channel
                      </Button>
                    ) : (
                      <AddEmailChannelBtn variant="outline" size="sm">
                        Add email channel
                      </AddEmailChannelBtn>
                    )}
                  </Match>
                  <Match when={channelType === ChannelType.telegram}>
                    <ConnectTelegramBotBtn variant="outline" size="sm">
                      Connect telegram bot
                    </ConnectTelegramBotBtn>
                  </Match>
                </Switch>
              </Box>
            </Box>
          )}
        </For>
      </VStack>
    </Show>
  );
};

export default EditNotificationChannels;
