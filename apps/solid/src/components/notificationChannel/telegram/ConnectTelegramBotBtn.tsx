import { Button, ButtonProps, notificationService } from '@hope-ui/solid';
import { MemoryCache } from '@shared/memory-cache';
import { ChannelType } from '@shared/types';
import { Component, onCleanup, createSignal } from 'solid-js';
import { useI18n } from '../../../i18n.context';
import { notificationChannelService } from '../../../lib/notificationChannel/notificationChannel.service';
import { useNotificationChannelsCtx } from '../../../lib/notificationChannel/notificationChannels.context';
import { getConnectTelegramBotHref } from '../../../lib/telegramBot';
import { useUserProfileCtx } from '../../../lib/user/user-profile.context';

const SNACK_CACHE_KEY = 'telegram_bot_connected_snack';

type ConnectTelegramBotBtnProps = Omit<
  ButtonProps<'a'>,
  'as' | 'target' | 'href' | 'children'
>;

const ConnectTelegramBotBtn: Component<ConnectTelegramBotBtnProps> = (
  props
) => {
  const [showSnack, setShowSnack] = createSignal(false);
  const [profileCtx] = useUserProfileCtx();
  const [i18n, { locale }] = useI18n();
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

    try {
      unsubFromLatestAdded =
        await notificationChannelService.$findLatestUpdatedChannelForMyProfile(
          ChannelType.telegram,
          (channel) => {
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
            title: i18n().t('notificationChannel.telegram.connectBot.success')
          });
          disposeListeners();
        }
      };

      if (!MemoryCache.has(SNACK_CACHE_KEY)) {
        document.addEventListener('visibilitychange', listener);
        MemoryCache.set(SNACK_CACHE_KEY, () => listener);
      }
    } catch (err) {
      notificationService.show({
        title: i18n().t('notificationChannel.telegram.connectBot.error', {
          message: err.message
        })
      });
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
          ? getConnectTelegramBotHref([
              profileCtx.profile.botPairingCode,
              locale()
            ])
          : ''
      }
    >
      {i18n().t('notificationChannel.telegram.connectBot.btn')}
    </Button>
  );
};

export default ConnectTelegramBotBtn;
