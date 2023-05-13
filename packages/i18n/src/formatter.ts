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
  private dateMonthYear: Intl.DateTimeFormat;
  private dateMonthYearWithTzArr: Intl.DateTimeFormat[];
  private dateWeekDay: Intl.DateTimeFormat;
  private dateDayMonthTime: Intl.DateTimeFormat;
  private dateDayMonthTimeWithTzArr: Intl.DateTimeFormat[];
  private dateTzOffsetShortLabel: Intl.DateTimeFormat[];
  private dateTzOffsetLongLabel: Intl.DateTimeFormat[];
  private timeLong: Intl.RelativeTimeFormat;
  private timeLongNumeric: Intl.RelativeTimeFormat;

  constructor(
    private locale: string,
    private options: LocaleFormatterExtraOptions
  ) {
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
    this.dateDayMonthTime = this.buildDateDayMonthTime();
    this.dateDayMonthTimeWithTzArr = [];
    this.dateMonthYear = this.buildDateMonthYear();
    this.dateMonthYearWithTzArr = [];
    this.dateTzOffsetLongLabel = [];
    this.dateTzOffsetShortLabel = [];

    this.detectedTimeZone = this.dateDayMonthYear.resolvedOptions().timeZone;
  }

  get timeZone() {
    return this.detectedTimeZone;
  }

  /**
   * @example
   * '30 мая 2012 г.', 'September 9, 2011'
   */
  dateToDayMonthYear(date: Date) {
    return this.dateDayMonthYear.format(date);
  }
  /**
   * @example
   * 'May 30', '30 Мая'
   */
  dateToDayMonth(date: Date) {
    return this.dateDayMonth.format(date);
  }
  /**
   * @example
   * 'September 8 at 18:00 Ukraine Time'
   */
  dateToDayMonthTime(
    date: Date,
    /** If passed, formatted date will show time in timezone */
    timeZone?: string
  ) {
    if (!timeZone) {
      return this.dateDayMonthTime.format(date);
    }

    let withTzFormatter = this.dateDayMonthTimeWithTzArr.find(
      (f) => f.resolvedOptions().timeZone === timeZone
    );

    if (!withTzFormatter) {
      withTzFormatter = this.buildDateDayMonthTime(timeZone);

      this.dateDayMonthTimeWithTzArr.push(withTzFormatter);
    }

    return withTzFormatter.format(date);
  }
  /**
   * @example
   * 'September 2023', 'Сентябрь 2023 г.'
   */
  dateToMonthYear(
    date: Date,
    /** Format value according to timezone */
    timeZone?: string
  ) {
    if (!timeZone) {
      return capitalizeFirstLetter(this.dateMonthYear.format(date));
    }

    let withTzFormatter = this.dateMonthYearWithTzArr.find(
      (f) => f.resolvedOptions().timeZone === timeZone
    );

    if (!withTzFormatter) {
      withTzFormatter = this.buildDateMonthYear(timeZone);
      this.dateMonthYearWithTzArr.push(withTzFormatter);
    }

    return capitalizeFirstLetter(withTzFormatter.format(date));
  }
  /**
   * @example
   * 'April', 'Сентябрь', 'Травень'
   */
  dateToMonth(date: Date) {
    return capitalizeFirstLetter(this.dateMonth.format(date));
  }
  /**
   * @example
   * 'Mon', 'Пт', 'Вт'
   */
  dateToWeekDay(date: Date) {
    return capitalizeFirstLetter(this.dateWeekDay.format(date));
  }
  /**
   * @example
   * 'Козерог', 'Taurus', 'Телець'
   */
  dateToZodiacSign(date: Date) {
    const idx = Number(this.zodiacSign.format(date)) - 1;

    return this.options.zodiacSignList[idx] || '';
  }
  /**
   * @example
   * '(GMT +2:00) Ukraine time (Europe/Kiev)'
   */
  dateToTimeZoneDescription(date: Date, timeZone: string) {
    let shortLabelFormat = this.dateTzOffsetShortLabel.find(
      (f) => f.resolvedOptions().timeZone === timeZone
    );

    if (!shortLabelFormat) {
      shortLabelFormat = new Intl.DateTimeFormat(this.locale, {
        timeZoneName: 'longOffset',
        timeZone
      });
      this.dateTzOffsetShortLabel.push(shortLabelFormat);
    }

    let longLabelFormat = this.dateTzOffsetLongLabel.find(
      (f) => f.resolvedOptions().timeZone === timeZone
    );

    if (!longLabelFormat) {
      longLabelFormat = new Intl.DateTimeFormat(this.locale, {
        timeZoneName: 'shortGeneric',
        timeZone
      });
      this.dateTzOffsetLongLabel.push(longLabelFormat);
    }

    const shortLabel = shortLabelFormat
      .formatToParts(date)
      .find((i) => i.type === 'timeZoneName')?.value;

    const longLabel = longLabelFormat
      .formatToParts(date)
      .find((i) => i.type === 'timeZoneName')?.value;

    return `(${shortLabel}) ${longLabel} (${timeZone})`;
  }
  /**
   * @example
   * 'in 30 days', 'через 2 дня', 'через 1 рік'
   */
  dateToDaysDiff(date: Date) {
    const days = getDateDayDiff(date);
    const phrase = this.timeLong.format(days, 'day');

    return {
      days,
      phrase: capitalizeFirstLetter(phrase)
    };
  }
  /**
   * @example
   * '30 минут', '7 лет', '14 років'
   */
  toPlainTime(
    value: number,
    unit: 'year' | 'month' | 'day' | 'hour' | 'minute'
  ) {
    let formatted = this.timeLongNumeric.format(value, unit);
    // strip "ago" literal
    formatted = formatted.match(/(\d+\s[^\s]+)/gi)?.[0] || formatted;

    return formatted;
  }

  private buildDateDayMonthTime(timeZone?: string) {
    return new Intl.DateTimeFormat(this.locale, {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'shortGeneric',
      hour12: false,
      timeZone
    });
  }

  private buildDateMonthYear(timeZone?: string) {
    return new Intl.DateTimeFormat(this.locale, {
      month: 'long',
      year: 'numeric',
      timeZone
    });
  }
}
