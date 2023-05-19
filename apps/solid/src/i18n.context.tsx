import {
  ParentComponent,
  createEffect,
  createResource,
  createContext,
  createSignal,
  createMemo,
  useContext,
  Accessor
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { createLocalStorage } from '@solid-primitives/storage';
import { Meta } from '@solidjs/meta';
import {
  ITranslationWeb,
  loadDictionary,
  localeToDialect,
  SupportedLocale,
  TranslationKeyWeb
} from '@shared/locales';
import { appConfig } from './appConfig';
import { initI18n } from '@shared/i18n';
import { MemoryCache } from '@shared/memory-cache';
import { setLocale as setYupLocale } from 'yup';

const localeToDictLoader = appConfig.languages.reduce<{
  [lang: string]: () => Promise<any>;
}>((acc, lang) => {
  acc[lang.locale] = () => loadDictionary(lang.locale).web();
  return acc;
}, {});

export type I18nWeb = ReturnType<
  typeof initI18n<ITranslationWeb, TranslationKeyWeb>
>;

type I18nContextInterface = [
  i18n: Accessor<I18nWeb>,
  actions: {
    /**
     * Switch to the language in the parameters.
     * Retrieve the current locale if no params
     */
    locale: (lang?: string) => string;
  }
];

export const I18nContext = createContext<I18nContextInterface>(
  {} as I18nContextInterface
);
export const useI18n = () => useContext(I18nContext);

export const resolveCurrentLocale = () =>
  localStorage.getItem('locale') || appConfig.defaultLocale;

export const resolveCurrentI18nInstance = () =>
  MemoryCache.get<I18nWeb>('i18n' + resolveCurrentLocale());

const useTranslateValidationSchema = (i18n: Accessor<I18nWeb>) => {
  createEffect(() => {
    const instance = i18n();

    if (!instance) return;

    const { t } = instance;

    setYupLocale({
      string: {
        min: ({ min }) => t('validation.string.minLength', { min }),
        max: ({ max }) => t('validation.string.maxLength', { max })
      },
      number: {
        min: ({ min }) => t('validation.number.minLength', { min }),
        max: ({ max }) => t('validation.number.maxLength', { max })
      },
      array: {
        min: ({ min }) => t('validation.array.minLength', { min }),
        max: ({ max }) => t('validation.array.minLength', { max })
      },
      mixed: {
        required: t('validation.mixed.required'),
        notType: ({ type }) => t('validation.mixed.notType', { type })
      }
    });
  });
};

const useSettings = () => {
  const [settings, setSettings] = createLocalStorage();

  const setLocaleSettings = (val: string) => setSettings('locale', val);

  const browserLocale = navigator.language.slice(0, 2);

  if (!settings.locale && browserLocale in localeToDictLoader) {
    setLocaleSettings(browserLocale);
  } else if (
    !settings.locale &&
    navigator.language.toLowerCase() in localeToDictLoader
  ) {
    setLocaleSettings(navigator.language.toLowerCase());
  }

  return [settings, setLocaleSettings] as const;
};

export const I18nProvider: ParentComponent = (props) => {
  const [settings, setSettings] = useSettings();

  const [loadedDicts, setLoadedDicts] = createStore<
    Record<string, ITranslationWeb>
  >({} as any);

  const [locale, setLocale] = createSignal(
    settings.locale in localeToDictLoader
      ? settings.locale
      : appConfig.defaultLocale
  );
  const [dict] = createResource<ITranslationWeb, string>(locale, (l) =>
    localeToDictLoader[l]()
  );

  const i18n = createMemo<I18nWeb>((prev) => {
    const lang = locale() as SupportedLocale;
    const langDict = loadedDicts[lang];

    if (!langDict) return prev as any;

    return MemoryCache.getOrSet('i18n' + lang, () =>
      initI18n<ITranslationWeb, TranslationKeyWeb>(
        localeToDialect(lang),
        langDict,
        {
          zodiacSignList: langDict.zodiacSign
        }
      )
    );
  });

  useTranslateValidationSchema(i18n);

  createEffect(() => {
    if (!dict.loading) {
      setLoadedDicts(locale(), (d) => Object.assign(d || {}, dict()));
    }
  });

  createEffect(() => {
    document.documentElement.lang = locale();
    setSettings(locale());
  });

  const ctx: I18nContextInterface = [
    i18n,
    {
      locale: (lang?: string) => (lang ? setLocale(lang) : locale())
    }
  ];

  return (
    <I18nContext.Provider value={ctx}>
      <Meta name="lang" content={locale()} />
      {props.children}
    </I18nContext.Provider>
  );
};
