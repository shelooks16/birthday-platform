import { LocaleFormatter, LocaleFormatterExtraOptions } from './formatter';
import type { PolyfilExtraOptions } from './polyfill';
import { translate } from './translate';

const loadPolyfill = (locale: string, options: PolyfilExtraOptions = {}) =>
  import('./polyfill').then((m) => m.i18nPolyfill(locale, options));

export type I18n<DictKey extends string> = {
  locale: string;
  t: <T = string>(
    key: DictKey,
    params?: Record<string, any>,
    defaultValue?: any
  ) => T;
  format: LocaleFormatter;
};

export const initI18n = async <
  Dict extends Record<string, any>,
  DictKey extends string
>(
  locale: string,
  dictionary: Dict,
  formatterOptions: LocaleFormatterExtraOptions,
  onPolyfillError?: (message: string) => any
) => {
  await loadPolyfill(locale, { forceLoadAll: false, onError: onPolyfillError });

  // *think* use js Proxy to catch LocaleFormatter method errors, then apply polyfill
  let format: LocaleFormatter;

  try {
    format = new LocaleFormatter(locale, formatterOptions);
  } catch (err) {
    await loadPolyfill(locale, {
      forceLoadAll: true,
      onError: onPolyfillError
    });
    format = new LocaleFormatter(locale, formatterOptions);
  }

  const val: I18n<DictKey> = {
    locale,
    t: <T>(key: DictKey, params?: Record<string, any>, defaultValue?: any) =>
      translate(dictionary, key, params, defaultValue) as T,
    format: format
  };

  return val;
};
