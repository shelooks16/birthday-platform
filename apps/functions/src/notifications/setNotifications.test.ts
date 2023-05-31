import { describe, expect, test } from 'vitest';
import { BirthDate, NotifyBeforePreset } from '@shared/types';
import { calculateNotificationTimestamp } from './setNotifications';

const createArgsForTimestamp = (
  timezone: string,
  month: number,
  day: number,
  year: number,
  frequency: string
): [BirthDate, NotifyBeforePreset, number, string] => {
  return [
    {
      day,
      month,
      year: 1990
    },
    frequency as NotifyBeforePreset,
    year,
    timezone
  ];
};

// Etc/GMT-12 is +12
// Etc/GMT+12 is -12
// bruh
describe('Notification timestamp considers timezone', () => {
  const targetYear = 2023;

  test('Etc/GMT-12', () => {
    const timestamp = calculateNotificationTimestamp(
      ...createArgsForTimestamp('Etc/GMT-12', 0, 1, targetYear, '1d')
    );
    // local 2023-12-31, 00:00 (tz +12)
    // utc 2023-12-30, 12:00

    expect(timestamp).toBe('2023-12-30T12:00:00.000Z');
  });

  test('Etc/GMT+12', () => {
    const timestamp = calculateNotificationTimestamp(
      ...createArgsForTimestamp('Etc/GMT+12', 0, 1, targetYear, '1h')
    );
    // local 2023-12-31, 23:00 (tz -12)
    // utc 2024-01-01, 11:00

    expect(timestamp).toBe('2024-01-01T11:00:00.000Z');
  });

  test('Europe/Kyiv', () => {
    const timestamp = calculateNotificationTimestamp(
      ...createArgsForTimestamp('Europe/Kyiv', 2, 20, targetYear, '3d')
    );
    // local 2023-03-17, 00:00 (tz +2)
    // utc 2023-03-16, 22:00

    expect(timestamp).toBe('2023-03-16T22:00:00.000Z');
  });

  test('Asia/Shanghai', () => {
    const timestamp = calculateNotificationTimestamp(
      ...createArgsForTimestamp('Asia/Shanghai', 9, 15, targetYear, '20h')
    );
    // local 2023-10-14, 04:00 (tz +8)
    // utc 2023-10-13, 20:00

    expect(timestamp).toBe('2023-10-13T20:00:00.000Z');
  });
});
