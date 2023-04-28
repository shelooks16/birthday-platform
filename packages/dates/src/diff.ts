export const getDateDayDiff = (targetDate: Date, fromDate = new Date()) => {
  const msPerDay = 1000 * 60 * 60 * 24;

  const utc1 = Date.UTC(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const utc2 = Date.UTC(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  return Math.floor((utc2 - utc1) / msPerDay);
};
