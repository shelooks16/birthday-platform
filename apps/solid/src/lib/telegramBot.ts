import { TeleBotStartPayload } from '@shared/types';
import { appConfig } from '../appConfig';

export const getConnectTelegramBotHref = (payload: TeleBotStartPayload) => {
  const payloadEncoded = btoa(JSON.stringify(payload));

  return `https://t.me/${appConfig.env.telegramBotId}?start=${payloadEncoded}`;
};
