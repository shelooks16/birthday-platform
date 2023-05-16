import { DeepKeyOf } from '@shared/types';
import en from './en';
import ru from './ru';
import uk from './uk';

const localeMap = {
  en: {
    loader: en,
    dialect: 'en-GB'
  },
  ru: {
    loader: ru,
    dialect: 'ru'
  },
  uk: {
    loader: uk,
    dialect: 'uk'
  }
};

export type SupportedLocale = keyof typeof localeMap;

export const fallbackLocale: SupportedLocale = 'en';
export const localeList: {
  locale: SupportedLocale;
  label: string;
}[] = [
  { locale: 'uk', label: 'Українська' },
  { locale: 'ru', label: 'Русский' },
  { locale: 'en', label: 'English' }
];

export const loadDictionary = (locale: SupportedLocale) =>
  localeMap[locale].loader;
export const localeToDialect = (locale: SupportedLocale) =>
  localeMap[locale].dialect;

export type ITranslationWeb = Awaited<ReturnType<(typeof en)['web']>>;
export type TranslationKeyWeb = DeepKeyOf<ITranslationWeb>;

export type ITranslationCommon = Awaited<ReturnType<(typeof en)['common']>>;
export type TranslationKeyCommon = DeepKeyOf<ITranslationCommon>;
