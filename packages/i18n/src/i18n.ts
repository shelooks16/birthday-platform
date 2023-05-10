import { LocaleFormatter, LocaleFormatterExtraOptions } from './formatter';
import { translate } from './translate';

type Cache = {
  get: (key: string) => any;
  set: (key: string, val: any) => any;
};

export type InitI18nOptions = {
  /** Cache i18n instance, cached per locale */
  cache?: Cache;
  /** Key to use in cache */
  cacheKey?: (locale: string) => string;
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
  t: <T = string>(
    key: DictKey,
    params?: Record<string, any>,
    defaultValue?: string
  ) => T;
  format: LocaleFormatter;
} => {
  const { cache, cacheKey: _cacheKey } = options;

  const cacheKey = _cacheKey ? _cacheKey(locale) : 'i18n' + locale;

  if (cache) {
    const existing = cache.get(cacheKey);

    if (existing) return existing;
  }

  const val = {
    t: <T>(key: DictKey, params?: Record<string, any>, defaultValue?: string) =>
      translate(dictionary, key, params, defaultValue) as T,
    format: new LocaleFormatter(locale, formatterOptions)
  };

  if (cache) {
    cache.set(cacheKey, val);
  }

  return val;
};
