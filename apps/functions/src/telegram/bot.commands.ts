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
import { I18nFunctions, useI18n } from '../i18n.context';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { notificationRepo } from '../notifications/notification.repository';
import { profileRepo } from '../profile/profile.repository';

// https://github.com/telegraf/telegraf/issues/504#issuecomment-1270571923
const parseStartPayload = (payload: any) => {
  if (!payload) return null;

  try {
    const payloadStr = Buffer.from(payload, 'base64').toString();

    const parsed = JSON.parse(payloadStr) as TeleBotStartPayload;
    const [pairingCode, locale] = parsed;

    if (!pairingCode) {
      return null;
    }

    return {
      pairingCode,
      locale: appConfig.isLanguageSupported(locale) ? locale : undefined
    };
  } catch (err) {
    return null;
  }
};

export const getConnectedProfiles = async (chatId: number) => {
  const channels = await notificationChannelRepo().findMany({
    where: [
      ['type', '==', ChannelType.telegram],
      ['value', '==', chatId]
    ]
  });

  const profileIds = channels.map((ch) => ch.profileId);

  const profiles =
    profileIds.length === 0
      ? []
      : await profileRepo().findManyByIds(profileIds);

  return { profiles, channels };
};

export const connectUserProfile = async (
  chatId: number,
  channelDisplayName: string,
  startPayload?: string
) => {
  const payload = parseStartPayload(startPayload);

  let locale = (payload?.locale ?? appConfig.defaultLocale) as SupportedLocale;
  let i18n = await useI18n(locale);

  if (!payload) {
    const { profiles } = await getConnectedProfiles(chatId);
    locale = appConfig.isLanguageSupported(profiles['0']?.locale)
      ? (profiles['0']?.locale as SupportedLocale)
      : locale;
    i18n = await useI18n(locale);

    return [i18n.t('telegramBot.connectProfile.noPayloadMessage'), locale];
  }

  let message = '';

  const profile = await profileRepo().findByBotPairingCode(payload.pairingCode);

  if (!profile) {
    return [i18n.t('telegramBot.connectProfile.profileNotFound'), locale];
  }

  locale = appConfig.isLanguageSupported(profile.locale)
    ? (profile.locale as SupportedLocale)
    : locale;
  i18n = await useI18n(locale);

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

    message = i18n.t('telegramBot.connectProfile.alreadyConnected', {
      name: profile.displayName
    });
  } else {
    await notificationChannelRepo().setOne({
      profileId: profile.id,
      type: ChannelType.telegram,
      value: chatId,
      displayName: channelDisplayName,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    });

    message = i18n.t('telegramBot.connectProfile.newConnected', {
      name: profile.displayName
    });
  }

  return [message, locale];
};

const buildMessageForSplit = (
  list: BirthdayDocumentWithDate[],
  title: string,
  i18n: I18nFunctions
) => {
  const messages: string[] = [`-- ${title} --`];

  list.forEach((b) => {
    messages.push(
      i18n.t('telegramBot./birthdays.item', {
        buddyName: b.buddyName,
        birthday: i18n.format.dateToDayMonth(b.asDateActiveYear)
      })
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

      const i18n = await useI18n(profile.locale);

      const birthdays = await birthdayRepo().findMany({
        where: [['profileId', '==', profile.id]]
      });

      const { todayList, pastList, upcomingList } = splitBirthdays(birthdays);

      const lists: string[] = [
        i18n.t('telegramBot./birthdays.title', { name: profile.displayName })
      ];

      if (todayList.length) {
        lists.push(
          buildMessageForSplit(
            todayList,
            i18n.t('telegramBot./birthdays.todayListTitle'),
            i18n
          )
        );
      }

      if (upcomingList.length) {
        lists.push(
          buildMessageForSplit(
            upcomingList,
            i18n.t('telegramBot./birthdays.futureListTitle'),
            i18n
          )
        );
      }

      if (pastList.length) {
        lists.push(
          buildMessageForSplit(
            pastList,
            i18n.t('telegramBot./birthdays.pastListTitle'),
            i18n
          )
        );
      }

      if (lists.length === 1) {
        lists.push(i18n.t('telegramBot./birthdays.noItems'));
      }

      messages.push(lists.join('\n\n'));
    })
  );

  return messages;
};

export const getMe = async (chatId: number) => {
  const { profiles } = await getConnectedProfiles(chatId);

  const messages: string[] = [];

  for (const profile of profiles) {
    if (profile) {
      const locale = appConfig.isLanguageSupported(profile.locale)
        ? profile.locale
        : appConfig.defaultLocale;

      const i18n = await useI18n(locale);
      const languageLabel = appConfig.languages.find(
        (lang) => lang.locale === locale
      )?.label;

      messages.push(
        '- ' +
          i18n.t('telegramBot./me.item', {
            name: profile.displayName,
            language: languageLabel
          })
      );
    }
  }

  if (messages.length === 0) {
    const i18n = await useI18n();

    messages.push(
      i18n.t('telegramBot./me.noItems', {
        website: appConfig.secrets.platform.website.value()
      })
    );
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

      const i18n = await useI18n(profile.locale);

      const lists: string[] = [
        i18n.t('telegramBot./notifications.title', {
          name: profile.displayName
        }) + '\n'
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

      if (channelIds.length === 0) {
        lists.push(i18n.t('telegramBot./notifications.noItems'));
        messages.push(lists.join('\n'));
        return;
      }

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

      if (notifications.length === 0) {
        lists.push(i18n.t('telegramBot./notifications.noItems'));
        messages.push(lists.join('\n'));
        return;
      }

      const birthdays = await birthdayRepo().findManyByIds(
        Array.from(new Set(notifications.map((n) => n.sourceBirthdayId)))
      );

      notifications.forEach((n) => {
        const birthday = birthdays.find((b) => b?.id === n.sourceBirthdayId);
        const channel = channels.find(
          (ch) => ch.id === n.notificationChannelId
        );

        lists.push(
          i18n.t('telegramBot./notifications.item', {
            notifyAt: i18n.format.dateToDayMonthTime(
              new Date(n.notifyAt),
              birthday?.notificationSettings?.timeZone
            ),
            buddyName: birthday?.buddyName ?? '-',
            channelType: i18n.t(
              `common.notificationChannel.labels.${channel?.type}` as any,
              {},
              channel?.type ?? '-'
            ),
            channel: channel?.displayName ?? '-'
          })
        );
      });

      messages.push(lists.join('\n'));
    })
  );

  return messages;
};
