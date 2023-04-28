import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { getTimestamp } from '@shared/firestore-utils';
import { ChannelType, TeleBotStartPayload } from '@shared/types';
import { getBirthdays } from '../birthday/queries';
import {
  createNotificationChannel,
  findNotificationChannelForProfile,
  getNotificationChannels,
  updateNotificationChannelById
} from '../notificationChannel/queries';
import { getProfileById } from '../profile/queries';
import { BirthdayTelegramBot } from './bot.types';

// https://github.com/telegraf/telegraf/issues/504#issuecomment-1270571923
const parseStartPayload = (payload: any) => {
  if (!payload) return null;

  try {
    const payloadStr = Buffer.from(payload, 'base64').toString();

    const parsed = JSON.parse(payloadStr) as Partial<TeleBotStartPayload>;

    if (!parsed.profileId) {
      return null;
    }

    const result: TeleBotStartPayload = {
      profileId: parsed.profileId
    };

    return result;
  } catch (err) {
    return null;
  }
};

export const connectUserProfile: Parameters<
  BirthdayTelegramBot['start']
>[0] = async (ctx) => {
  const payload = parseStartPayload(ctx.startPayload);

  if (!payload) return;

  const chatId = ctx.chat.id;

  let text = '';

  try {
    const profile = await getProfileById(payload.profileId);

    if (!profile) return;

    const existingChannel = await findNotificationChannelForProfile(
      profile.id,
      ChannelType.telegram,
      chatId
    );

    const channelDisplayName =
      ctx.from.username ??
      ctx.from.first_name ??
      ctx.from.last_name ??
      ctx.from.id;

    if (existingChannel) {
      await updateNotificationChannelById(existingChannel.id, {
        displayName: channelDisplayName
      });

      text = `${profile.displayName}, твой аккаунт уже подключен к этому боту. Данные были обновлены.`;
    } else {
      await createNotificationChannel({
        profileId: profile.id,
        type: ChannelType.telegram,
        value: chatId,
        displayName: channelDisplayName,
        createdAt: getTimestamp()
      });

      text =
        `Привет, ${profile.displayName}!\n` +
        'Твой аккаунт теперь подключен к этому боту.\n' +
        'Бот будет отправлять тебе нотификации о днюхах. Помимо нотификаций, бот так же выполняет другие функции.';
    }
  } catch (err) {
    // todo handle
  }

  await ctx.sendMessage(text);
};

const buildMessageForSplit = (
  title: string,
  list: BirthdayDocumentWithDate[]
) => {
  let message = `-- ${title} --` + '\n';

  list.forEach((b) => {
    message += `${b.buddyName}` + '\n';
  });

  return message + '\n';
};

export const sendBirthdayList: Parameters<
  BirthdayTelegramBot['command']
>[1] = async (ctx) => {
  const channels = await getNotificationChannels([
    ['type', '==', ChannelType.telegram],
    ['value', '==', ctx.chat.id]
  ]);

  for (const channel of channels) {
    const birthdays = await getBirthdays([
      'profileId',
      '==',
      channel.profileId
    ]);

    const { todayList, pastList, upcomingList } = splitBirthdays(birthdays);

    let message = '';

    if (todayList.length) {
      message += buildMessageForSplit('Today', todayList);
    }

    if (upcomingList.length) {
      message += buildMessageForSplit('Upcoming', upcomingList);
    }

    if (pastList.length) {
      message += buildMessageForSplit('Past', pastList);
    }

    await ctx.sendMessage(message);
  }
};
