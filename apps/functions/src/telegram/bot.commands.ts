import { telegramChannel } from '@shared/notification-channels';
import { TeleBotStartPayload } from '@shared/types';
import { getProfileById, updateProfileById } from '../profile/queries';
import { BirthdayTelegramBot } from './bot.types';

// https://github.com/telegraf/telegraf/issues/504#issuecomment-1270571923
const parseStartPayload = (payload: any) => {
  if (!payload) return null;

  try {
    const payloadStr = Buffer.from(payload, 'base64').toString();

    const parsed = JSON.parse(payloadStr) as Partial<TeleBotStartPayload>;

    if (!parsed.userId) {
      return null;
    }

    const result: TeleBotStartPayload = {
      userId: parsed.userId
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
  const { username } = ctx.from;

  try {
    const profile = await getProfileById(payload.userId);

    if (!profile) return;

    const alreadyConnectedIdx = profile.verifiedNotifyChannels.findIndex(
      (ch) => telegramChannel.isValid(ch) && ch.includes(chatId.toString())
    );

    const updatedVerifiedChannels = Array.from(profile.verifiedNotifyChannels);
    const teleChannel = telegramChannel.make(chatId, username);

    let text = '';

    if (alreadyConnectedIdx >= 0) {
      updatedVerifiedChannels[alreadyConnectedIdx] = teleChannel;
      text = `${profile.displayName}, твой аккаунт уже подключен к этому боту. Данные были обновлены.`;
    } else {
      updatedVerifiedChannels.push(teleChannel);
      text =
        `Привет, ${profile.displayName}!\n` +
        'Твой аккаунт теперь подключен к этому боту.\n' +
        'Бот будет отправлять тебе нотификации о днюхах. Помимо нотификаций, бот так же выполняет другие функции.';
    }

    await updateProfileById(payload.userId, {
      verifiedNotifyChannels: updatedVerifiedChannels
    });

    await ctx.sendMessage(text);
  } catch (err) {
    //
  }
};
