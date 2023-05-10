import { getDateDayDiff } from '@shared/dates';
import { capitalizeFirstLetter } from '@shared/general-utils';

export type LocaleFormatterExtraOptions = {
  zodiacSignList: string[];
};

export class LocaleFormatter {
  private detectedTimeZone: string;

  private zodiacSign: Intl.DateTimeFormat;
  private dateDayMonthYear: Intl.DateTimeFormat;
  private dateDayMonth: Intl.DateTimeFormat;
  private dateMonth: Intl.DateTimeFormat;
  private dateWeekDay: Intl.DateTimeFormat;
  private timeLong: Intl.RelativeTimeFormat;
  private timeLongNumeric: Intl.RelativeTimeFormat;

  constructor(locale: string, private options: LocaleFormatterExtraOptions) {
    this.zodiacSign = new Intl.DateTimeFormat('fr-TN-u-ca-persian', {
      month: 'numeric'
    });
    this.dateDayMonthYear = new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    this.dateDayMonth = new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric'
    });
    this.dateMonth = new Intl.DateTimeFormat(locale, {
      month: 'long'
    });
    this.dateWeekDay = new Intl.DateTimeFormat(locale, {
      weekday: 'short'
    });
    this.timeLong = new Intl.RelativeTimeFormat(locale, {
      style: 'long',
      numeric: 'auto'
    });
    this.timeLongNumeric = new Intl.RelativeTimeFormat(locale, {
      style: 'long',
      numeric: 'always'
    });

    this.detectedTimeZone = this.dateDayMonthYear.resolvedOptions().timeZone;
  }

  get timeZone() {
    return this.detectedTimeZone;
  }

  dateToDayMonthYear(date: Date) {
    return this.dateDayMonthYear.format(date);
  }
  dateToDayMonth(date: Date) {
    return this.dateDayMonth.format(date);
  }
  dateToMonth(date: Date) {
    return capitalizeFirstLetter(this.dateMonth.format(date));
  }
  dateToWeekDay(date: Date) {
    return capitalizeFirstLetter(this.dateWeekDay.format(date));
  }
  dateToZodiacSign(date: Date) {
    const idx = Number(this.zodiacSign.format(date)) - 1;

    return this.options.zodiacSignList[idx] || '';
  }
  /** @examples 'in 30 minutes', 'через 7 лет', 'через 14 років' */
  dateToDaysDiff(date: Date) {
    const days = getDateDayDiff(date);
    const phrase = this.timeLong.format(days, 'day');

    return {
      days,
      phrase: capitalizeFirstLetter(phrase)
    };
  }
  /** @examples '30 минут', '7 лет', '14 років' */
  toPlainTime(
    value: number,
    unit: 'year' | 'month' | 'day' | 'hour' | 'minute'
  ) {
    let formatted = this.timeLongNumeric.format(value, unit);
    // strip "ago" literal
    formatted = formatted.match(/(\d+\s[^\s]+)/gi)?.[0] || formatted;

    return formatted;
  }
}
