import * as functions from 'firebase-functions';

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

let secrets: Secrets;

export const appConfig = {
  birthdayWishLimitPerDay: 3,
  isDevEnv: process.env.FUNCTIONS_EMULATOR === 'true',
  env: () => {
    secrets = secrets ?? functions.config();
    return secrets;
  }
};
