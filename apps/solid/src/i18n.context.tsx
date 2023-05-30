import {
  ParentComponent,
  createEffect,
  createResource,
  createContext,
  createSignal,
  createMemo,
  useContext,
  Accessor,
  Switch,
  Match
} from 'solid-js';
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
import { I18n, initI18n } from '@shared/i18n';
import { MemoryCache } from '@shared/memory-cache';
import { setLocale as setYupLocale } from 'yup';
import { Alert } from '@hope-ui/solid';

const localeToDictLoader = appConfig.languages.reduce<{
  [lang: string]: () => Promise<any>;
}>((acc, lang) => {
  acc[lang.locale] = () => loadDictionary(lang.locale).web();
  return acc;
}, {});

export type I18nWeb = I18n<TranslationKeyWeb>;

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
  MemoryCache.get<I18nWeb | undefined>('i18n' + resolveCurrentLocale());

const useTranslateValidationSchema = (i18n: Accessor<I18nWeb>) => {
  createEffect(() => {
    const instance = i18n();

    if (!instance) return;

    const { t } = instance;

    setYupLocale({
      string: {
        min: ({ min }) => t('validation.string.minLength', { min }),
        max: ({ max }) => t('validation.string.maxLength', { max }),
        trim: t('validation.string.trim')
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
        notType: ({ type }) => t('validation.mixed.notType', { type }),
        oneOf: ({ values }) => t('validation.mixed.oneOf', { values })
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

  const [locale, setLocale] = createSignal(
    settings.locale in localeToDictLoader
      ? settings.locale
      : appConfig.defaultLocale
  );

  createEffect(() => {
    document.documentElement.lang = locale();
    setSettings(locale());
  });

  const [i18nResource] = createResource<I18nWeb, string>(locale, async (l) => {
    const dictionary = await localeToDictLoader[l]();

    return MemoryCache.getOrSet('i18n' + l, () =>
      initI18n<ITranslationWeb, TranslationKeyWeb>(
        localeToDialect(l as SupportedLocale),
        dictionary,
        {
          zodiacSignList: dictionary.common.zodiacSign
        },
        console.log
      )
    );
  });

  const i18n = createMemo<I18nWeb>(() =>
    !i18nResource.error && i18nResource.latest
      ? i18nResource.latest
      : (null as unknown as I18nWeb)
  );

  useTranslateValidationSchema(i18n);

  const ctx: I18nContextInterface = [
    i18n,
    {
      locale: (lang?: string) => (lang ? setLocale(lang) : locale())
    }
  ];

  return (
    <I18nContext.Provider value={ctx}>
      <Meta name="lang" content={locale()} />
      <Switch>
        <Match when={i18nResource.error}>
          <Alert status="danger">{i18nResource.error.message}</Alert>
        </Match>
        <Match when={i18n()}>{props.children}</Match>
      </Switch>
    </I18nContext.Provider>
  );
};
