import { LocaleFormatter, LocaleFormatterExtraOptions } from './formatter';
import { translate } from './translate';

type Cache = {
  get: (key: string) => any;
  set: (key: string, val: any) => any;
};

export type InitI18nOptions = {
  /** Cache i18n instance, cached per locale */
  cache?: Cache;
};

export const initI18n = <
  Dict extends Record<string, any>,
  DictKey extends string
>(
  locale: string,
  dictionary: Dict,
  formatterOptions: LocaleFormatterExtraOptions,
  options: InitI18nOptions = {}
): {
  t: <T>(
    key: DictKey,
    params?: Record<string, any>,
    defaultValue?: string
  ) => T;
  format: LocaleFormatter;
} => {
  const { cache } = options;

  if (cache) {
    const existing = cache.get('i18n' + locale);

    if (existing) return existing;
  }

  const val = {
    t: <T>(key: DictKey, params?: Record<string, any>, defaultValue?: string) =>
      translate(dictionary, key, params, defaultValue) as T,
    format: new LocaleFormatter(locale, formatterOptions)
  };

  if (cache) {
    cache.set('i18n' + locale, val);
  }

  return val;
};
