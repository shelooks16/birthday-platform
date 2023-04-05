import { describe, expect, test } from 'vitest';
import { calculateNotificationTimestamp } from './setNotifications';
import { BirthdayDocument } from '@shared/types';

const createBirthdayTestData = (
  notifyTimeZone: string,
  month: number,
  day: number
): Pick<BirthdayDocument, 'birth' | 'notifyTimeZone'> => ({
  birth: {
    day,
    month,
    year: 1990
  },
  notifyTimeZone
});

// Etc/GMT-12 is +12
// Etc/GMT+12 is -12
// bruh
describe('Notification timestamp considers timezone', () => {
  const targetYear = 2023;

  test('Etc/GMT-12', () => {
    const testBirthday = createBirthdayTestData('Etc/GMT-12', 0, 1);
    const atBefore = '1d';
    // local 2023-12-31, 00:00 (tz +12)
    // utc 2023-12-30, 12:00

    const timestamp = calculateNotificationTimestamp(
      testBirthday,
      atBefore,
      targetYear
    );

    expect(timestamp).toBe('2023-12-30T12:00:00.000Z');
  });

  test('Etc/GMT+12', () => {
    const testBirthday = createBirthdayTestData('Etc/GMT+12', 0, 1);
    const atBefore = '1h';
    // local 2023-12-31, 23:00 (tz -12)
    // utc 2024-01-01, 11:00

    const timestamp = calculateNotificationTimestamp(
      testBirthday,
      atBefore,
      targetYear
    );

    expect(timestamp).toBe('2024-01-01T11:00:00.000Z');
  });

  test('Europe/Kyiv', () => {
    const testBirthday = createBirthdayTestData('Europe/Kyiv', 2, 28);
    const atBefore = '3d';
    // local 2023-03-25, 00:00 (tz +2)
    // utc 2023-03-24, 22:00

    const timestamp = calculateNotificationTimestamp(
      testBirthday,
      atBefore,
      targetYear
    );

    expect(timestamp).toBe('2023-03-24T22:00:00.000Z');
  });

  test('Asia/Shanghai', () => {
    const testBirthday = createBirthdayTestData('Asia/Shanghai', 9, 15);
    const atBefore = '20h';
    // local 2023-10-14, 04:00 (tz +8)
    // utc 2023-10-13, 20:00

    const timestamp = calculateNotificationTimestamp(
      testBirthday,
      atBefore,
      targetYear
    );

    expect(timestamp).toBe('2023-10-13T20:00:00.000Z');
  });
});
