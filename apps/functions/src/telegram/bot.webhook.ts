import { createOnRequestFunction } from '../utils/createFunction';
import { createTelegramBot } from './createTelegramBot';

export const telegramBot = createOnRequestFunction(async (req, res) => {
  const bot = await createTelegramBot();

  return bot.handleUpdate(req.body, res);
});
