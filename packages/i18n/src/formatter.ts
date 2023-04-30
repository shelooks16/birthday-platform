import { getDateDayDiff } from '@shared/dates';

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
    // capitalizeFirstLetter
    return this.dateMonth.format(date);
  }
  dateToWeekDay(date: Date) {
    // capitalizeFirstLetter
    return this.dateWeekDay.format(date);
  }
  dateToZodiacSign(date: Date) {
    const idx = Number(this.zodiacSign.format(date)) - 1;

    return this.options.zodiacSignList[idx] || '';
  }
  dateToDaysDiff(date: Date) {
    const days = getDateDayDiff(date);
    const phrase = this.timeLong.format(days, 'day');

    return {
      days,
      phrase
      // phrase: capitalizeFirstLetter(phrase)
    };
  }
  toAge(birthdayYear: number, currentYear: number) {
    const age = currentYear - birthdayYear;

    let formatted = this.timeLong.format(age, 'year');
    // strip "ago" literal
    formatted = formatted.match(/(\d+\s[^\s]+)/gi)?.[0] || formatted;

    return formatted;
  }
}
