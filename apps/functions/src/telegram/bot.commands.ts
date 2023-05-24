import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { getTimestamp, WhereClause } from '@shared/firestore-utils';
import { SupportedLocale } from '@shared/locales';
import {
  ChannelType,
  NotificationChannelDocumentField,
  TeleBotStartPayload
} from '@shared/types';
import { appConfig } from '../appConfig';
import { birthdayRepo } from '../birthday/birthday.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { notificationRepo } from '../notifications/notification.repository';
import { profileRepo } from '../profile/profile.repository';

// https://github.com/telegraf/telegraf/issues/504#issuecomment-1270571923
const parseStartPayload = (payload: any) => {
  if (!payload) return null;

  try {
    const payloadStr = Buffer.from(payload, 'base64').toString();

    const parsed = JSON.parse(payloadStr) as Partial<TeleBotStartPayload>;

    if (!parsed.pairingCode) {
      return null;
    }

    const result: TeleBotStartPayload = {
      pairingCode: parsed.pairingCode,
      locale: appConfig.isLanguageSupported(parsed.locale)
        ? parsed.locale
        : undefined
    };

    return result;
  } catch (err) {
    return null;
  }
};

export const connectUserProfile = async (
  chatId: number,
  channelDisplayName: string,
  startPayload?: string
) => {
  const payload = parseStartPayload(startPayload);
  let locale = (payload?.locale ?? appConfig.defaultLocale) as SupportedLocale;

  if (!payload) return 'Привет!';

  let message = '';

  const profile = await profileRepo().findByBotPairingCode(payload.pairingCode);

  if (!profile) {
    return 'Профиль пользователя не найден. Попробуй заново.';
  }

  locale = appConfig.isLanguageSupported(profile.locale)
    ? (profile.locale as SupportedLocale)
    : locale;

  const existingChannel =
    await notificationChannelRepo().findChannelByProfileId(
      profile.id,
      ChannelType.telegram,
      chatId
    );

  if (existingChannel) {
    await notificationChannelRepo().updateOne({
      id: existingChannel.id,
      displayName: channelDisplayName,
      updatedAt: getTimestamp()
    });

    message = `${profile.displayName}, твой аккаунт уже подключен к этому боту. Данные были обновлены.`;
  } else {
    await notificationChannelRepo().setOne({
      profileId: profile.id,
      type: ChannelType.telegram,
      value: chatId,
      displayName: channelDisplayName,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    });

    message =
      `Привет, ${profile.displayName}!\n` +
      'Твой аккаунт теперь подключен к этому боту.\n' +
      'Бот будет отправлять тебе нотификации о днюхах. Помимо нотификаций, бот так же выполняет другие функции.';
  }

  return message;
};

const getConnectedProfiles = async (chatId: number) => {
  const channels = await notificationChannelRepo().findMany({
    where: [
      ['type', '==', ChannelType.telegram],
      ['value', '==', chatId]
    ]
  });

  const profiles = await profileRepo().findManyByIds(
    channels.map((ch) => ch.profileId)
  );

  return { profiles, channels };
};

const buildMessageForSplit = (
  title: string,
  list: BirthdayDocumentWithDate[]
) => {
  const messages: string[] = [`-- ${title} --`];

  list.forEach((b) => {
    messages.push(
      `${b.buddyName} - ${b.birth.year}.${b.birth.month + 1}.${b.birth.day}`
    );
  });

  return messages.join('\n');
};

export const getBirthdayList = async (chatId: number) => {
  const { profiles } = await getConnectedProfiles(chatId);

  const messages: string[] = [];

  await Promise.all(
    profiles.map(async (profile) => {
      if (!profile) return;

      const birthdays = await birthdayRepo().findMany({
        where: [['profileId', '==', profile.id]]
      });

      const { todayList, pastList, upcomingList } = splitBirthdays(birthdays);

      const lists: string[] = [`Birthdays for ${profile.displayName}`];

      if (todayList.length) {
        lists.push(buildMessageForSplit('Today', todayList));
      }

      if (upcomingList.length) {
        lists.push(buildMessageForSplit('Upcoming', upcomingList));
      }

      if (pastList.length) {
        lists.push(buildMessageForSplit('Past', pastList));
      }

      messages.push(lists.join('\n\n'));
    })
  );

  return messages;
};

export const getMe = async (chatId: number) => {
  const { profiles } = await getConnectedProfiles(chatId);

  const messages: string[] = ['Аккаунты подключенные к этому боту:'];

  for (const profile of profiles) {
    if (profile) {
      messages.push(`- ${profile.displayName}`);
    }
  }

  return messages.join('\n');
};

export const getNotifications = async (
  chatId: number,
  channelType?: ChannelType
) => {
  const { profiles } = await getConnectedProfiles(chatId);

  const messages: string[] = [];

  await Promise.all(
    profiles.map(async (profile) => {
      if (!profile) return;

      const lists: string[] = [
        `Upcoming notifications for ${profile.displayName}\n`
      ];

      const where: WhereClause<NotificationChannelDocumentField>[] = [
        ['profileId', '==', profile.id]
      ];

      if (channelType) {
        where.push(['type', '==', channelType]);
      }

      const channels = await notificationChannelRepo().findMany({
        where
      });
      const channelIds = channels.map((ch) => ch.id);

      if (channelIds.length === 0) return;

      const notifications = await notificationRepo().findMany({
        where: [
          ['profileId', '==', profile.id],
          ['isSent', '==', false],
          ['notificationChannelId', 'in', channelIds]
        ],
        orderBy: {
          notifyAt: 'asc'
        }
      });

      if (notifications.length === 0) return;

      const birthdays = await birthdayRepo().findManyByIds(
        Array.from(new Set(notifications.map((n) => n.sourceBirthdayId)))
      );

      notifications.forEach((n) => {
        const birthday = birthdays.find((b) => b?.id === n.sourceBirthdayId);
        const channel = channels.find(
          (ch) => ch.id === n.notificationChannelId
        );

        lists.push(
          `${n.notifyAt} - ${birthday?.buddyName ?? 'Unknown buddy'} - ${
            channel?.type ?? 'Unknown channel type'
          }`
        );
      });

      messages.push(lists.join('\n'));
    })
  );

  return messages;
};
