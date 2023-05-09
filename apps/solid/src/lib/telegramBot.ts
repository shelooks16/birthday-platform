import { TeleBotStartPayload } from '@shared/types';

const botId = 'BirthdayLocalHostBot';

export const getConnectTelegramBotHref = (payload: TeleBotStartPayload) => {
  const payloadEncoded = btoa(JSON.stringify(payload));

  return `https://t.me/${botId}?start=${payloadEncoded}`;
};
