import * as functions from 'firebase-functions';
import { isEmulator } from './utils/emulator';

interface Secrets {
  mailclient: {
    sender: string;
    password: string;
    host: string;
    port: string;
    secure: 'true' | 'false';
  };
  openai?: {
    secretkey?: string;
  };
  telegram: {
    bot_token: string;
  };
}

const secrets = functions.config() as Secrets;

export const appConfig = {
  birthdayWishLimitPerDay: 3,
  isDevEnv: isEmulator,
  env: secrets
};
