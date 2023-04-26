import { secrets } from '../config';
import { connectUserProfile } from './bot.commands';
import { BirthdayTelegramBot } from './bot.types';

let cachedBot: BirthdayTelegramBot;

export async function createTelegramBot() {
  if (cachedBot) return cachedBot;

  const { Telegraf } = await import('telegraf');

  const bot = new Telegraf(secrets.telegram.bot_token);

  bot.start(connectUserProfile);

  cachedBot = bot;

  return bot;
}
