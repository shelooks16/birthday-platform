import { fallbackLocale, localeList } from '@shared/locales';

export const appConfig = {
  calendar: {
    startWeekFromDayIdx: 1,
    numOfVisibleItemsPerDayCell: 2
  },
  defaultBirthdaysView: 'calendar',
  languages: localeList,
  isLanguageSupported: (locale?: string) =>
    locale ? appConfig.languages.some((l) => l.locale === locale) : false,
  defaultLocale: fallbackLocale,
  isDevEnv: import.meta.env.DEV,
  env: {
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    },
    telegramBotId: import.meta.env.VITE_TELEGRAM_BOT_ID,
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT
    }
  },
  developerInfo: {
    name: 'Andrii Hulenko',
    buyMeACoffe: {
      id: 'shelooks16'
    }
  }
};
