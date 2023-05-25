import { MemoryCache } from '@shared/memory-cache';
import { ChannelType } from '@shared/types';
import { appConfig } from '../appConfig';
import { useI18n } from '../i18n.context';
import {
  connectUserProfile,
  getBirthdayList,
  getConnectedProfiles,
  getMe,
  getNotifications
} from './bot.commands';

// Get id from https://t.me/RawDataBot
const WELCOME_STICKER_ID =
  'CAACAgUAAxkBAAEgTD5kSXgMrMOKFYaxB0Cv8FUrZwn2CgACuw8AAsZRxhX44kGODQJCei8E';

const getCommandListMsg = async (locale?: string) => {
  const { t } = await useI18n(locale);

  return (
    `${t('telegramBot.commandList.title')}:\n\n` +
    `/me - ${t('telegramBot.commandList.command.me')}\n` +
    `/birthdays - ${t('telegramBot.commandList.command.birthdays')}\n` +
    `/notifications - ${t('telegramBot.commandList.command.notifications')}\n` +
    `/tnotifications - ${t('telegramBot.commandList.command.tnotifications')}`
  );
};

const formatError = async (error: any, locale?: string) => {
  const { t } = await useI18n(locale);

  const message = error?.message || error?.description || error.status;

  return t('telegramBot.errorMessage', { message });
};

const telegramBot = async () => {
  const { Telegraf } = await import('telegraf');

  const bot = new Telegraf(appConfig.env().telegram.bot_token);

  bot.start(async (ctx) => {
    try {
      const [message, locale] = await connectUserProfile(
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
      await ctx.sendMessage(await getCommandListMsg(locale));
    } catch (err) {
      await ctx.sendMessage(await formatError(err));
    }
  });
  bot.command('me', async (ctx) => {
    try {
      const msg = await getMe(ctx.chat.id);

      await ctx.sendMessage(msg);
    } catch (err) {
      await ctx.sendMessage(await formatError(err));
    }
  });
  bot.command('birthdays', async (ctx) => {
    try {
      const messages = await getBirthdayList(ctx.chat.id);

      for (const msg of messages) {
        await ctx.sendMessage(msg);
      }
    } catch (err) {
      await ctx.sendMessage(await formatError(err));
    }
  });
  bot.command('notifications', async (ctx) => {
    try {
      const messages = await getNotifications(ctx.chat.id);

      for (const msg of messages) {
        await ctx.sendMessage(msg);
      }
    } catch (err) {
      await ctx.sendMessage(await formatError(err));
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
      await ctx.sendMessage(await formatError(err));
    }
  });
  bot.hears(/.*/, async (ctx) => {
    try {
      const { profiles } = await getConnectedProfiles(ctx.chat.id);

      await ctx.sendMessage(await getCommandListMsg(profiles['0']?.locale));
    } catch (err) {
      await ctx.sendMessage(await formatError(err));
    }
  });

  return bot;
};

export const createTelegramBot = async () =>
  MemoryCache.getOrSet('telegrambot', telegramBot);
