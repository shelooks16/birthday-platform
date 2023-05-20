import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from '../appConfig';
import { connectUserProfile, getBirthdayList } from './bot.commands';

const telegramBot = async () => {
  const { Telegraf } = await import('telegraf');

  const bot = new Telegraf(appConfig.env().telegram.bot_token);

  bot.start(async (ctx) => {
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
  });
  bot.command('birthdays', async (ctx) => {
    const messages = await getBirthdayList(ctx.chat.id);

    for (const msg of messages) {
      await ctx.sendMessage(msg);
    }
  });
  bot.on(['message'], (ctx) => {
    if ('reply_to_message' in ctx.message) {
      console.log(ctx.message.reply_to_message);
    }
  });

  // bot.command('remove', (ctx) => {
  //   return ctx.replyWithHTML(
  //     '<b>Coke</b> or <i>Pepsi?</i>',
  //     Markup.removeKeyboard()
  //   );
  // });

  // bot.command('custom', async (ctx) => {
  //   return await ctx.replyWithSticker(
  //     'CAACAgUAAxkBAAEgTD5kSXgMrMOKFYaxB0Cv8FUrZwn2CgACuw8AAsZRxhX44kGODQJCei8E'
  //   );
  //   // Markup.keyboard([
  //   //   ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
  //   //   ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
  //   //   ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
  //   // ]).oneTime()
  // });

  return bot;
};

export const createTelegramBot = async () =>
  MemoryCache.getOrSet('telegrambot', telegramBot);
