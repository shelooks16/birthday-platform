import { fallbackLocale, localeList } from '@shared/locales';
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
  birthdayWishLimitPerGenerate: 3,
  isDevEnv: process.env.FUNCTIONS_EMULATOR === 'true',
  languages: localeList,
  isLanguageSupported: (locale?: string) =>
    locale ? appConfig.languages.some((l) => l.locale === locale) : false,
  defaultLocale: fallbackLocale,
  env: () => {
    secrets = secrets ?? functions.config();
    return secrets;
  }
};
