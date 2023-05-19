import { LocaleFormatter, LocaleFormatterExtraOptions } from './formatter';
import { translate } from './translate';

export const initI18n = <
  Dict extends Record<string, any>,
  DictKey extends string
>(
  locale: string,
  dictionary: Dict,
  formatterOptions: LocaleFormatterExtraOptions
): {
  locale: string;
  t: <T = string>(
    key: DictKey,
    params?: Record<string, any>,
    defaultValue?: any
  ) => T;
  format: LocaleFormatter;
} => {
  const val = {
    locale,
    t: <T>(key: DictKey, params?: Record<string, any>, defaultValue?: any) =>
      translate(dictionary, key, params, defaultValue) as T,
    format: new LocaleFormatter(locale, formatterOptions)
  };

  return val;
};
