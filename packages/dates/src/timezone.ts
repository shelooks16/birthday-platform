const normalizeTzName = (tzName: string) => {
  if (tzName.includes('Kyiv')) {
    return 'Europe/Kiev';
  }

  return tzName;
};

/**
 * Get offset in minutes for a timezone
 */
export const getTimezoneOffset = (timeZone: string, date = new Date()) => {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(
    date.toLocaleString('en-US', { timeZone: normalizeTzName(timeZone) })
  );
  return (tzDate.getTime() - utcDate.getTime()) / 6e4;
};
