import { getDateDayDiff } from '@shared/dates';
import { BirthdayDocument } from '@shared/types';

const sortByDaysLeftInAsc = (
  one: BirthdayDocumentWithDate,
  two: BirthdayDocumentWithDate
) =>
  getDateDayDiff(one.asDateActiveYear) - getDateDayDiff(two.asDateActiveYear);
const sortByDaysLeftInDesc = (
  one: BirthdayDocumentWithDate,
  two: BirthdayDocumentWithDate
) =>
  getDateDayDiff(two.asDateActiveYear) - getDateDayDiff(one.asDateActiveYear);

export type BirthdayDocumentWithDate = BirthdayDocument & {
  asDateActiveYear: Date;
};

export const splitBirthdays = (birthdays: BirthdayDocument[]) => {
  const now = new Date();
  const nowDate = now.getDate();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const todayList: BirthdayDocumentWithDate[] = [];
  const upcomingList: BirthdayDocumentWithDate[] = [];
  const pastList: BirthdayDocumentWithDate[] = [];

  birthdays.forEach((_b) => {
    const b: BirthdayDocumentWithDate = {
      ..._b,
      asDateActiveYear: new Date(nowYear, _b.birth.month, _b.birth.day)
    };

    if (b.birth.day === nowDate && b.birth.month === nowMonth) {
      todayList.push(b);
    } else if (b.asDateActiveYear.getTime() < now.getTime()) {
      pastList.push(b);
    } else {
      upcomingList.push(b);
    }
  });

  return {
    todayList: todayList.sort(sortByDaysLeftInAsc),
    upcomingList: upcomingList.sort(sortByDaysLeftInAsc),
    pastList: pastList.sort(sortByDaysLeftInDesc)
  };
};
