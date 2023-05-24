// https://formatjs.io/docs/polyfills
import { shouldPolyfill as shouldPolyfillGetCanonicalLocales } from '@formatjs/intl-getcanonicallocales/should-polyfill';
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill';
import { shouldPolyfill as shouldPolyfillPluralRules } from '@formatjs/intl-pluralrules/should-polyfill';
import { shouldPolyfill as shouldPolyfillNumberFormat } from '@formatjs/intl-numberformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillRelatimeTimeFormat } from '@formatjs/intl-relativetimeformat/should-polyfill';
import { shouldPolyfill as shouldPolyfillDateTimeFormat } from '@formatjs/intl-datetimeformat/should-polyfill';

// to overcome rollup dynamic import, use static imports for supported locales
// meh but works
// https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations

async function polyfillGetCanonicalLocales(forceLoad = false) {
  // This platform already supports Intl.getCanonicalLocales
  if (forceLoad || shouldPolyfillGetCanonicalLocales()) {
    await import('@formatjs/intl-getcanonicallocales/polyfill-force.js').then(
      (mod) => mod.default
    );
  }
}

async function polyfillLocale(forceLoad = false) {
  // This platform already supports Intl.Locale
  if (forceLoad || shouldPolyfillLocale()) {
    await import('@formatjs/intl-locale/polyfill-force.js').then(
      (mod) => mod.default
    );
  }
}

async function polyfillPluralRules(locale: string, forceLoad = false) {
  const unsupportedLocale = forceLoad
    ? locale
    : shouldPolyfillPluralRules(locale);

  if (!unsupportedLocale) {
    return;
  }

  await import('@formatjs/intl-pluralrules/polyfill-force.js').then(
    (mod) => mod.default
  );

  if (unsupportedLocale.startsWith('en')) {
    await import('@formatjs/intl-pluralrules/locale-data/en.js');
  } else if (unsupportedLocale === 'ru') {
    await import('@formatjs/intl-pluralrules/locale-data/ru.js');
  } else if (unsupportedLocale === 'uk') {
    await import('@formatjs/intl-pluralrules/locale-data/uk.js');
  }
}

async function polyfillNumberFormat(locale: string, forceLoad = false) {
  const unsupportedLocale = forceLoad
    ? locale
    : shouldPolyfillNumberFormat(locale);

  if (!unsupportedLocale) {
    return;
  }

  await import('@formatjs/intl-numberformat/polyfill-force.js').then(
    (mod) => mod.default
  );
  switch (unsupportedLocale) {
    case 'en-GB':
      await import('@formatjs/intl-numberformat/locale-data/en-GB.js');
      break;
    case 'ru':
      await import('@formatjs/intl-numberformat/locale-data/ru.js');
      break;
    case 'uk':
      await import('@formatjs/intl-numberformat/locale-data/uk.js');
      break;
  }
}

async function polyfillRelatimeTimeFormat(locale: string, forceLoad = false) {
  const unsupportedLocale = forceLoad
    ? locale
    : shouldPolyfillRelatimeTimeFormat(locale);

  if (!unsupportedLocale) {
    return;
  }

  await import('@formatjs/intl-relativetimeformat/polyfill-force.js').then(
    (mod) => mod.default
  );
  switch (unsupportedLocale) {
    case 'en-GB':
      await import('@formatjs/intl-relativetimeformat/locale-data/en-GB.js');
      break;
    case 'ru':
      await import('@formatjs/intl-relativetimeformat/locale-data/ru.js');
      break;
    case 'uk':
      await import('@formatjs/intl-relativetimeformat/locale-data/uk.js');
      break;
  }
}

async function polyfillDateTimeFormat(locale: string, forceLoad = false) {
  const unsupportedLocale = forceLoad
    ? locale
    : shouldPolyfillDateTimeFormat(locale);

  if (!unsupportedLocale) {
    return;
  }

  let detectedTz = '';
  try {
    detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    //
  }

  await import('@formatjs/intl-datetimeformat/polyfill-force.js').then(
    (mod) => mod.default
  );

  // Parallelize CLDR data loading
  const dataPolyfills = [import('@formatjs/intl-datetimeformat/add-all-tz.js')];

  switch (unsupportedLocale) {
    case 'en-GB':
      dataPolyfills.push(
        import('@formatjs/intl-datetimeformat/locale-data/en-GB.js')
      );
      break;
    case 'ru':
      dataPolyfills.push(
        import('@formatjs/intl-datetimeformat/locale-data/ru.js')
      );
      break;
    case 'uk':
      dataPolyfills.push(
        import('@formatjs/intl-datetimeformat/locale-data/uk.js')
      );
      break;
  }

  await Promise.all(dataPolyfills);

  if (detectedTz && '__setDefaultTimeZone' in Intl.DateTimeFormat) {
    // @ts-expect-error polyfil interface
    Intl.DateTimeFormat.__setDefaultTimeZone(detectedTz);
  }
}

export type PolyfilExtraOptions = {
  /** @default false */
  forceLoadAll?: boolean;
  onError?: (message: string) => any;
};

export const i18nPolyfill = async (
  locale: string,
  options: PolyfilExtraOptions = {}
) => {
  const { forceLoadAll = false, onError } = options;

  for (const runPolyfill of [
    () => polyfillGetCanonicalLocales(forceLoadAll),
    () => polyfillLocale(forceLoadAll),
    () => polyfillPluralRules(locale, forceLoadAll),
    () => polyfillNumberFormat(locale, forceLoadAll),
    () => polyfillRelatimeTimeFormat(locale, forceLoadAll),
    () => polyfillDateTimeFormat(locale, forceLoadAll)
  ]) {
    try {
      await runPolyfill();
    } catch (err) {
      onError?.(`Error loading i18n polyfill: ${err.message}`);
    }
  }
};
