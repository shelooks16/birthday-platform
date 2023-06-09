import { FireCollection } from '@shared/firestore-collections';
import {
  BirthDate,
  BirthdayDocument,
  BirthdayNotificationSettings,
  FrequencyUnit,
  NotificationDocument,
  NotifyBeforePreset
} from '@shared/types';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { getTimezoneOffset } from '@shared/dates';
import { parseNotifyBeforePreset } from '@shared/notification';
import { logger } from '../utils/logger';
import {
  createDebugHttpFn,
  createOnWriteFunction,
  createScheduledFunction,
  OnCreateHandler,
  OnDeleteHandler,
  OnUpdateHandler
} from '../utils/createFunction';
import { birthdayRepo } from '../birthday/birthday.repository';
import { notificationRepo } from './notification.repository';

const isTheSameArr = (arr1?: any[], arr2?: any[]) =>
  Array.from(arr1 ?? [])
    .sort()
    .toString() ===
  Array.from(arr2 ?? [])
    .sort()
    .toString();

export const calculateNotificationTimestamp = (
  birthDate: BirthDate,
  notifyBeforePreset: NotifyBeforePreset,
  targetYear: number,
  timeZone: string
) => {
  const { value: unitValue, frequencyUnit: unit } =
    parseNotifyBeforePreset(notifyBeforePreset);

  const timestamp = new Date(targetYear, birthDate.month, birthDate.day);

  const targetTzOffset_min = getTimezoneOffset(timeZone, timestamp);
  const totalTzOffset_min = timestamp.getTimezoneOffset() + targetTzOffset_min;

  timestamp.setTime(timestamp.getTime() - totalTzOffset_min * 6e4);

  switch (unit) {
    case FrequencyUnit.days: {
      timestamp.setDate(timestamp.getDate() - unitValue);
      break;
    }
    case FrequencyUnit.hours: {
      timestamp.setHours(timestamp.getHours() - unitValue);
      break;
    }
    case FrequencyUnit.minutes: {
      timestamp.setMinutes(timestamp.getMinutes() - unitValue);
      break;
    }
    case FrequencyUnit.months: {
      timestamp.setMonth(timestamp.getMonth() - unitValue);
      break;
    }
    default:
  }

  // consider New Year's change
  // (1) localtime in new year, utc is in old year
  if (timestamp.getFullYear() - targetYear === -1) {
    timestamp.setFullYear(targetYear);
  }

  // (2) utc in new year, localtime is in old year
  const withTz = new Date(timestamp.getTime() + targetTzOffset_min * 6e4);

  if (withTz.getFullYear() - targetYear === -1) {
    timestamp.setFullYear(targetYear + 1);
  }

  return getTimestamp(timestamp);
};

const buildNotificationDocs = async (
  birthdayId: string,
  birthDate: BirthDate,
  profileId: string,
  notificationSettings: BirthdayNotificationSettings,
  year: number,
  checkForDuplicates = false
) => {
  const docs: Omit<NotificationDocument, 'id'>[] = [];

  // wth, no wayyyeee
  await Promise.all(
    notificationSettings.notifyChannelsIds.map(
      async (notificationChannelId) => {
        await Promise.all(
          notificationSettings.notifyAtBefore.map(async (formula) => {
            const notifyAt = calculateNotificationTimestamp(
              birthDate,
              formula,
              year,
              notificationSettings.timeZone
            );

            if (notifyAt < getTimestamp()) return;

            if (checkForDuplicates) {
              const alreadyExists = await notificationRepo()
                .findMany({
                  where: [
                    ['sourceBirthdayId', '==', birthdayId],
                    ['notificationChannelId', '==', notificationChannelId],
                    ['notifyAt', '==', notifyAt]
                  ],
                  limit: 1
                })
                .then((r) => r.length > 0);

              if (alreadyExists) return;
            }

            docs.push({
              createdAt: getTimestamp(),
              sourceBirthdayId: birthdayId,
              profileId,
              notifyAt,
              notificationChannelId,
              isScheduled: false,
              isSent: false
            });
          })
        );
      }
    )
  );

  return docs;
};

const onCreate: OnCreateHandler = async (createEvent) => {
  const birthdayDoc = firestoreSnapshotToData<BirthdayDocument>(
    createEvent.data!.after
  )!;
  const { id, notificationSettings, birth, profileId } = birthdayDoc;

  if (!notificationSettings) {
    logger.info('Exiting. Birthday comes without notifications', {
      id
    });
    return;
  }

  logger.info('Creating notifications for birthday', { id });

  const batch = notificationRepo().batch();

  const notificationDocs = await buildNotificationDocs(
    id,
    birth,
    profileId,
    notificationSettings,
    new Date().getFullYear()
  );
  notificationRepo().atomicSetMany(batch, notificationDocs);

  await batch.commit();

  logger.info('Notifications created for birthday', {
    id,
    createCount: notificationDocs.length
  });
};

const onUpdate: OnUpdateHandler = async (updateEvent) => {
  const birthdayBefore = firestoreSnapshotToData<BirthdayDocument>(
    updateEvent.data.before
  )!;
  const birthdayAfter = firestoreSnapshotToData<BirthdayDocument>(
    updateEvent.data.after
  )!;

  const isBirthDateTheSame =
    birthdayBefore.birth.day === birthdayAfter.birth.day &&
    birthdayBefore.birth.month === birthdayAfter.birth.month &&
    birthdayBefore.birth.year === birthdayAfter.birth.year;

  const isNotificationTimeTheSame = isTheSameArr(
    birthdayBefore.notificationSettings?.notifyAtBefore,
    birthdayAfter.notificationSettings?.notifyAtBefore
  );

  const isNotificationChannelsTheSame = isTheSameArr(
    birthdayBefore.notificationSettings?.notifyChannelsIds,
    birthdayAfter.notificationSettings?.notifyChannelsIds
  );

  const isTimeZoneTheSame =
    birthdayBefore.notificationSettings?.timeZone ==
    birthdayAfter.notificationSettings?.timeZone;

  const isUnchanged =
    isBirthDateTheSame &&
    isNotificationTimeTheSame &&
    isNotificationChannelsTheSame &&
    isTimeZoneTheSame;

  if (isUnchanged) {
    logger.info('Skipping notifications update', {
      birthdayId: birthdayAfter.id
    });
    return;
  }

  logger.info('Updating notifications for birthday', {
    id: birthdayAfter.id
  });

  const currentNotifications = await notificationRepo().findMany({
    where: [
      ['sourceBirthdayId', '==', birthdayAfter.id],
      ['isScheduled', '==', false],
      ['isSent', '==', false],
      ['notifyAt', '>=', new Date().getUTCFullYear().toString()]
    ]
  });

  let createCount = 0;

  const batch = notificationRepo().batch();

  notificationRepo().atomicDeleteMany(batch, currentNotifications);

  if (birthdayAfter.notificationSettings) {
    const notificationDocs = await buildNotificationDocs(
      birthdayAfter.id,
      birthdayAfter.birth,
      birthdayAfter.profileId,
      birthdayAfter.notificationSettings,
      new Date().getFullYear()
    );

    notificationRepo().atomicSetMany(batch, notificationDocs);

    createCount = notificationDocs.length;
  }

  await batch.commit();

  const countDiff = currentNotifications.length - createCount;

  logger.info('Updated notifications for birthday', {
    id: birthdayAfter.id,
    currentTotalCount: createCount,
    deleteCount: countDiff > 0 ? countDiff : 0,
    createCount: countDiff < 0 ? countDiff * -1 : 0
  });
};

const onDelete: OnDeleteHandler = async (deleteEvent) => {
  const { id } = firestoreSnapshotToData<BirthdayDocument>(
    deleteEvent.data!.before
  )!;

  logger.info('Deleting notifications for birthday', { id });

  const notifications = await notificationRepo().findMany({
    where: [['sourceBirthdayId', '==', id]]
  });

  const batch = notificationRepo().batch();

  notificationRepo().atomicDeleteMany(batch, notifications);

  await batch.commit();

  logger.info('Deleted notifications for birthday', {
    id,
    deleteCount: notifications.length
  });
};

export const onBirthdayWriteSetNotifications = createOnWriteFunction(
  FireCollection.birthdays.docMatch,
  {
    onCreate,
    onUpdate,
    onDelete
  }
);

const createNotificationsForNewYear = async () => {
  const targetYear = new Date().getFullYear();

  logger.info('Creating notifications for all birthdays in target year', {
    targetYear
  });

  const birthdays = await birthdayRepo().findMany();

  let totalNotificationsCreated = 0;

  await Promise.all(
    birthdays.map(async (birthday) => {
      if (birthday.notificationSettings) {
        const notificationDocs = await buildNotificationDocs(
          birthday.id,
          birthday.birth,
          birthday.profileId,
          birthday.notificationSettings,
          targetYear,
          true
        );

        const batch = notificationRepo().batch();

        notificationRepo().atomicSetMany(batch, notificationDocs);

        await batch.commit();

        totalNotificationsCreated += notificationDocs.length;
      }
    })
  );

  logger.info('Birthdays processed', {
    totalProcessed: birthdays.length,
    totalNotificationsCreated
  });
};

export const setNotificationsForNewYear = createScheduledFunction(
  '1 of jan 00:00',
  createNotificationsForNewYear
);

export const debugSetNotificationsForNewYear = createDebugHttpFn(
  createNotificationsForNewYear
);
