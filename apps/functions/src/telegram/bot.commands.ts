import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { getTimestamp } from '@shared/firestore-utils';
import { ChannelType, TeleBotStartPayload } from '@shared/types';
import { birthdayRepo } from '../birthday/birthday.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { profileRepo } from '../profile/profile.repository';
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
    const profile = await profileRepo().findById(payload.profileId);

    if (!profile) return;

    const existingChannel =
      await notificationChannelRepo().findChannelByProfileId(
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
      await notificationChannelRepo().updateOne({
        id: existingChannel.id,
        displayName: channelDisplayName
      });

      text = `${profile.displayName}, твой аккаунт уже подключен к этому боту. Данные были обновлены.`;
    } else {
      await notificationChannelRepo().setOne({
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
    console.log('catched err', err.message);
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
  const channels = await notificationChannelRepo().findMany({
    where: [
      ['type', '==', ChannelType.telegram],
      ['value', '==', ctx.chat.id]
    ]
  });

  for (const channel of channels) {
    const birthdays = await birthdayRepo().findMany({
      where: [['profileId', '==', channel.profileId]]
    });

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
