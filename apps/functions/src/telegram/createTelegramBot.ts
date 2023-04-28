import { secrets } from '../config';
import { connectUserProfile, sendBirthdayList } from './bot.commands';
import { BirthdayTelegramBot } from './bot.types';

let cachedBot: BirthdayTelegramBot;

export async function createTelegramBot() {
  if (cachedBot) return cachedBot;

  const { Telegraf } = await import('telegraf');

  const bot = new Telegraf(secrets.telegram.bot_token);

  bot.start(connectUserProfile);
  bot.command('birthdays', sendBirthdayList);

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

  cachedBot = bot;

  return bot;
}
