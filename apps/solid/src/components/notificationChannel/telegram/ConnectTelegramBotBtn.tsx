import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { MemoryCache } from '@shared/memory-cache';
import { ChannelType } from '@shared/types';
import { Component, onCleanup, createSignal } from 'solid-js';
import { notificationChannelService } from '../../../lib/notificationChannel/notificationChannel.service';
import { useNotificationChannelsCtx } from '../../../lib/notificationChannel/notificationChannels.context';
import { getConnectTelegramBotHref } from '../../../lib/telegramBot';
import { useUserProfileCtx } from '../../../lib/user/user-profile.context';

const SNACK_CACHE_KEY = 'telegram_bot_connected_snack';

type ConnectTelegramBotBtnProps = Omit<
  ButtonProps<'a'>,
  'as' | 'target' | 'href'
>;

const ConnectTelegramBotBtn: Component<ConnectTelegramBotBtnProps> = (
  props
) => {
  const [showSnack, setShowSnack] = createSignal(false);
  const [profileCtx] = useUserProfileCtx();
  const [, { mutate }] = useNotificationChannelsCtx();

  let unsubFromLatestAdded: () => void;

  const disposeListeners = () => {
    unsubFromLatestAdded && unsubFromLatestAdded();

    if (MemoryCache.has(SNACK_CACHE_KEY)) {
      document.removeEventListener(
        'visibilitychange',
        MemoryCache.getThenDelete(SNACK_CACHE_KEY)
      );
      setShowSnack(false);
    }
  };

  const handleClick = async () => {
    disposeListeners();
    const clickedAt = new Date().toISOString();

    const db = await notificationChannelService.db();

    unsubFromLatestAdded = db.$findMany(
      {
        where: [
          ['profileId', '==', profileCtx.profile!.id],
          ['type', '==', ChannelType.telegram],
          ['updatedAt', '>', clickedAt]
        ],
        orderBy: { updatedAt: 'asc' },
        limitToLast: 1
      },
      (channels) => {
        const channel = channels[0];

        if (!channel) return;

        mutate((chs) =>
          chs && !chs.some((c) => c.id === channel.id)
            ? chs.concat(channel)
            : chs
        );
        unsubFromLatestAdded();
        setShowSnack(true);
      }
    );

    const listener = () => {
      if (document.hidden) return;

      if (showSnack()) {
        notificationService.show({
          status: 'success',
          title: 'Connected to telegram bot'
        });
        disposeListeners();
      }
    };

    if (!MemoryCache.has(SNACK_CACHE_KEY)) {
      document.addEventListener('visibilitychange', listener);
      MemoryCache.set(SNACK_CACHE_KEY, () => listener);
    }
  };

  onCleanup(disposeListeners);

  return (
    <Button
      {...props}
      as="a"
      target="_blank"
      onClick={handleClick}
      disabled={!profileCtx.profile}
      href={
        profileCtx.profile
          ? getConnectTelegramBotHref({
              pairingCode: profileCtx.profile.botPairingCode
            })
          : ''
      }
    >
      Connect telegram bot
    </Button>
  );
};

export default ConnectTelegramBotBtn;
