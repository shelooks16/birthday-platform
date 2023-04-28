export type FormatDateSettings = {
  showDay?: boolean;
  showYear?: boolean;
  locale?: string;
};

export const formatDate = (date: Date, settings?: FormatDateSettings) => {
  const { showDay = true, showYear = true, locale = 'en' } = settings || {};

  const d = new Date(date);

  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: showDay ? 'numeric' : undefined,
    year: showYear ? 'numeric' : undefined
  });

  return formatter.format(d);
};
