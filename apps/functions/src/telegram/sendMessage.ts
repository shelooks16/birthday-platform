import { createTelegramBot } from './createTelegramBot';

export const sendTelegramMessage = async (
  chatId: string | number,
  message: string
) => {
  const bot = await createTelegramBot();

  await bot.telegram.sendMessage(chatId, message);
};
