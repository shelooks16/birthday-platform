import { initI18n, I18n } from '@shared/i18n';
import {
  ITranslationFunctions,
  loadDictionary,
  localeToDialect,
  SupportedLocale,
  TranslationKeyFunctions
} from '@shared/locales';
import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from './appConfig';
import { logger } from './utils/logger';

export type I18nFunctions = I18n<TranslationKeyFunctions>;

const loadI18n = async (locale: SupportedLocale) => {
  const dictionary = await loadDictionary(locale).functions();

  return initI18n<ITranslationFunctions, TranslationKeyFunctions>(
    localeToDialect(locale),
    dictionary,
    {
      zodiacSignList: dictionary.zodiacSign
    },
    logger.warn
  );
};

export const useI18n = async (
  locale: SupportedLocale = appConfig.defaultLocale
) => {
  if (!appConfig.isLanguageSupported(locale)) {
    logger.warn('Locale is not supported. Using default locale fallback.', {
      locale,
      defaultLocale: appConfig.defaultLocale
    });
    locale = appConfig.defaultLocale;
  }

  return MemoryCache.getOrSet('i18n' + locale, () => loadI18n(locale));
};
