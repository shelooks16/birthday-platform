import { fallbackLocale, localeList } from '@shared/locales';

export const appConfig = {
  calendar: {
    startWeekFromDayIdx: 1,
    numOfVisibleItemsPerDayCell: 2
  },
  defaultBirthdaysView: 'calendar',
  languages: localeList,
  defaultLocale: fallbackLocale
};
