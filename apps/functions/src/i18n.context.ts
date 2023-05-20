import { initI18n } from '@shared/i18n';
import {
  ITranslationFunctions,
  loadDictionary,
  localeToDialect,
  SupportedLocale,
  TranslationKeyFunctions
} from '@shared/locales';
import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from './appConfig';

export type I18nFunctions = ReturnType<
  typeof initI18n<ITranslationFunctions, TranslationKeyFunctions>
>;

const loadI18n = async (locale: SupportedLocale) => {
  const dictionary = await loadDictionary(locale).functions();

  return initI18n<ITranslationFunctions, TranslationKeyFunctions>(
    localeToDialect(locale),
    dictionary,
    {
      zodiacSignList: dictionary.zodiacSign
    }
  );
};

export const useI18n = async (
  locale: SupportedLocale = appConfig.defaultLocale
) => {
  if (!appConfig.languages.some((lang) => locale === lang.locale)) {
    throw new Error(`Locale ${locale} is not supported.`);
  }

  return MemoryCache.getOrSet('i18n' + locale, () => loadI18n(locale));
};
