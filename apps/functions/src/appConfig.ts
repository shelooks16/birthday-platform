import { fallbackLocale, localeList } from '@shared/locales';
import { logger } from './utils/logger';

/** Secret stored in GCP Secret Manager */
type SecretParam = {
  /** Secret name in GCP Secret Manager */
  name: string;
  /** Secret value getter */
  value: () => string;
};

const defineSecret = (name: string): SecretParam => {
  return {
    name,
    value: () => {
      if (process.env['FUNCTIONS_CONTROL_API'] === 'true') {
        throw new Error(
          `Cannot access secret "${name}" during deployment. Secret values are only available at runtime.`
        );
      }

      const runtimeValue = process.env[name];

      if (runtimeValue === undefined) {
        logger.warn(`No value found for secret "${name}"`);
      }

      return runtimeValue || '';
    }
  };
};

interface Secrets {
  platform: {
    website: SecretParam;
  };
  mailclient: {
    sender: SecretParam;
    password: SecretParam;
    host: SecretParam;
    port: SecretParam;
    secure: SecretParam;
  };
  openai: {
    secretkey: SecretParam;
  };
  telegram: {
    bot_token: SecretParam;
  };
}

const secrets: Secrets = {
  platform: {
    website: defineSecret('PLATFORM_WEBSITE')
  },
  mailclient: {
    host: defineSecret('MAILCLIENT_HOST'),
    secure: defineSecret('MAILCLIENT_SECURE'),
    port: defineSecret('MAILCLIENT_PORT'),
    sender: defineSecret('MAILCLIENT_SENDER'),
    password: defineSecret('MAILCLIENT_PASSWORD')
  },
  telegram: {
    bot_token: defineSecret('TELEGRAM_BOT_TOKEN')
  },
  openai: {
    secretkey: defineSecret('OPENAI_SECRETKEY')
  }
};

export const appConfig = {
  secrets,
  platformName: 'Buddy Birthday',
  birthdayWishLimitPerGenerate: 3,
  isDevEnv: process.env['FUNCTIONS_EMULATOR'] === 'true',
  languages: localeList,
  isLanguageSupported: (locale?: string) =>
    locale ? appConfig.languages.some((l) => l.locale === locale) : false,
  defaultLocale: fallbackLocale
};
