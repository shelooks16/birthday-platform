import { MemoryCache } from '@shared/memory-cache';
import { ChannelType } from '@shared/types';
import { appConfig } from '../appConfig';
import {
  connectUserProfile,
  getBirthdayList,
  getMe,
  getNotifications
} from './bot.commands';

// Get id from https://t.me/RawDataBot
const WELCOME_STICKER_ID =
  'CAACAgUAAxkBAAEgTD5kSXgMrMOKFYaxB0Cv8FUrZwn2CgACuw8AAsZRxhX44kGODQJCei8E';

const getCommandListMsg = () => {
  return (
    `Список комманд:\n` +
    '/me - Аккаунты подключенные к этому боту\n' +
    '/birthdays - Список твоих днюх\n' +
    '/notifications - Список ближайших уведомлений\n' +
    '/tnotifications - Список ближайших уведомлений через телеграм'
  );
};

const formatError = (error: any) => {
  const msg = error?.message || error?.description || error.status;

  return 'Ошибка: ' + msg;
};

const telegramBot = async () => {
  const { Telegraf } = await import('telegraf');

  const bot = new Telegraf(appConfig.env().telegram.bot_token);

  bot.start(async (ctx) => {
    try {
      const message = await connectUserProfile(
        ctx.chat.id,
        ctx.from.username ??
          ctx.from.first_name ??
          ctx.from.last_name ??
          ctx.from.id,
        ctx.startPayload
      );

      if (message) {
        await ctx.sendMessage(message);
      }

      await ctx.replyWithSticker(WELCOME_STICKER_ID);
      await ctx.sendMessage(getCommandListMsg());
    } catch (err) {
      await ctx.sendMessage(formatError(err));
    }
  });
  bot.command('me', async (ctx) => {
    try {
      const msg = await getMe(ctx.chat.id);

      await ctx.sendMessage(msg);
    } catch (err) {
      await ctx.sendMessage(formatError(err));
    }
  });
  bot.command('birthdays', async (ctx) => {
    try {
      const messages = await getBirthdayList(ctx.chat.id);

      for (const msg of messages) {
        await ctx.sendMessage(msg);
      }
    } catch (err) {
      await ctx.sendMessage(formatError(err));
    }
  });
  bot.command('notifications', async (ctx) => {
    try {
      const messages = await getNotifications(ctx.chat.id);

      for (const msg of messages) {
        await ctx.sendMessage(msg);
      }
    } catch (err) {
      await ctx.sendMessage(formatError(err));
    }
  });
  bot.command('tnotifications', async (ctx) => {
    try {
      const messages = await getNotifications(
        ctx.chat.id,
        ChannelType.telegram
      );

      for (const msg of messages) {
        await ctx.sendMessage(msg);
      }
    } catch (err) {
      await ctx.sendMessage(formatError(err));
    }
  });
  bot.hears(/.*/, async (ctx) => {
    await ctx.sendMessage(getCommandListMsg());
  });

  return bot;
};

export const createTelegramBot = async () =>
  MemoryCache.getOrSet('telegrambot', telegramBot);
