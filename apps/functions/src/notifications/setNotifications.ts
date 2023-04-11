import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import {
  BirthDate,
  BirthdayDocument,
  BirthdayNotificationSettings,
  FireCollection,
  FrequencyUnit,
  NotificationDocument
} from '@shared/types';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData,
  getTimestamp
} from '@shared/firestore-utils';
import { getTimezoneOffset } from '@shared/dates';
import {
  createDebugHttpFn,
  createOnWriteFunction,
  createScheduledFunction,
  OnCreateHandler,
  OnDeleteHandler,
  OnUpdateHandler
} from '../utils/createFunction';
import { getNotifications, getNotificationsForBirthday } from './queries';
import { batchMany } from '../utils/batch';

const isTheSameArr = (arr1?: any[], arr2?: any[]) =>
  Array.from(arr1 ?? [])
    .sort()
    .toString() ===
  Array.from(arr2 ?? [])
    .sort()
    .toString();

export const calculateNotificationTimestamp = (
  birthDate: BirthDate,
  frequencyFormula: string,
  targetYear: number,
  timeZone: string
) => {
  const unitValue = parseInt(frequencyFormula, 10);
  const unit = frequencyFormula.replace(/\d/g, '') as FrequencyUnit;

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

const deleteNotificationDocsWithinBatch = (
  batch: FirebaseFirestore.WriteBatch,
  notificationDocs: NotificationDocument[]
) => {
  const firestore = getFirestore();

  let count = 0;

  notificationDocs.forEach((doc) => {
    batch.delete(
      firestore.collection(FireCollection.notifications).doc(doc.id)
    );
    count++;
  });

  return count;
};

const createNotificationDocsWithinBatch = async (
  batch: FirebaseFirestore.WriteBatch,
  birthdayId: string,
  birthDate: BirthDate,
  notificationSettings: BirthdayNotificationSettings,
  year: number,
  checkForDuplicates = false
) => {
  const firestore = getFirestore();

  let count = 0;

  // wth, no wayyyeee
  await Promise.all(
    notificationSettings.notifyChannels.map(async (channel) => {
      await Promise.all(
        notificationSettings.notifyAtBefore.map(async (formula) => {
          const notifyAt = calculateNotificationTimestamp(
            birthDate,
            formula,
            year,
            notificationSettings.timeZone
          );

          if (notifyAt < getTimestamp()) return;

          const data: Omit<NotificationDocument, 'id'> = {
            sourceBirthdayId: birthdayId,
            notifyAt,
            notifyChannel: channel,
            isScheduled: false,
            isSent: false
          };

          if (checkForDuplicates) {
            const alreadyExists = await getNotifications(
              ['notifyAt', '==', data.notifyAt],
              ['notifyChannel', '==', data.notifyChannel],
              ['sourceBirthdayId', '==', data.sourceBirthdayId]
            ).then((r) => r.length > 0);

            if (alreadyExists) return;
          }

          batch.create(
            firestore.collection(FireCollection.notifications).doc(),
            data
          );
          count++;
        })
      );
    })
  );

  return count;
};

const onCreate: OnCreateHandler = async (docSnap) => {
  const firestore = getFirestore();
  const birthdayDoc = firestoreSnapshotToData<BirthdayDocument>(docSnap)!;
  const { id, notificationSettings, birth } = birthdayDoc;

  if (!notificationSettings) {
    functions.logger.info('Exiting. Birthday comes without notifications', {
      id
    });
    return;
  }

  functions.logger.info('Creating notifications for birthday', { id });

  const batch = firestore.batch();

  const createCount = await createNotificationDocsWithinBatch(
    batch,
    id,
    birth,
    notificationSettings,
    new Date().getFullYear()
  );

  await batch.commit();

  functions.logger.info('Notifications created for birthday', {
    id,
    createCount
  });
};

const onUpdate: OnUpdateHandler = async (docSnapBefore, docSnapAfter) => {
  const birthdayBefore =
    firestoreSnapshotToData<BirthdayDocument>(docSnapBefore)!;
  const birthdayAfter =
    firestoreSnapshotToData<BirthdayDocument>(docSnapAfter)!;

  const isBirthDateTheSame =
    birthdayBefore.birth.day === birthdayAfter.birth.day &&
    birthdayBefore.birth.month === birthdayAfter.birth.month &&
    birthdayBefore.birth.year === birthdayAfter.birth.year;

  const isNotificationTimeTheSame = isTheSameArr(
    birthdayBefore.notificationSettings?.notifyAtBefore,
    birthdayAfter.notificationSettings?.notifyAtBefore
  );

  const isNotificationChannelsTheSame = isTheSameArr(
    birthdayBefore.notificationSettings?.notifyChannels,
    birthdayAfter.notificationSettings?.notifyChannels
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
    functions.logger.info('Skipping notifications update', {
      birthdayId: birthdayAfter.id
    });
    return;
  }

  const firestore = getFirestore();

  functions.logger.info('Updating notifications for birthday', {
    id: birthdayAfter.id
  });

  const currentNotifications = await getNotificationsForBirthday(
    birthdayAfter.id,
    ['isScheduled', '==', false],
    ['isSent', '==', false],
    ['notifyAt', '>=', new Date().getUTCFullYear().toString()]
  );

  let updateCount = 0;

  const batch = firestore.batch();

  deleteNotificationDocsWithinBatch(batch, currentNotifications);

  if (birthdayAfter.notificationSettings) {
    updateCount = await createNotificationDocsWithinBatch(
      batch,
      birthdayAfter.id,
      birthdayAfter.birth,
      birthdayAfter.notificationSettings,
      new Date().getFullYear()
    );
  } else {
    updateCount = currentNotifications.length;
  }

  await batch.commit();

  functions.logger.info('Updated notifications for birthday', {
    id: birthdayAfter.id,
    updateCount
  });
};

const onDelete: OnDeleteHandler = async (docSnap) => {
  const firestore = getFirestore();
  const { id } = firestoreSnapshotToData<BirthdayDocument>(docSnap)!;

  functions.logger.info('Deleting pending notifications for birthday', { id });

  const notifications = await getNotificationsForBirthday(
    id,
    ['isScheduled', '==', false],
    ['isSent', '==', false]
  );

  const batch = firestore.batch();

  const deleteCount = deleteNotificationDocsWithinBatch(batch, notifications);

  await batch.commit();

  functions.logger.info('Pending notifications deleted for birthday', {
    id,
    deleteCount
  });
};

export const setNotifications = createOnWriteFunction(
  `${FireCollection.birthdays}/{id}`,
  {
    onCreate,
    onUpdate,
    onDelete
  }
);

const createNotificationsForNewYear = async () => {
  const targetYear = new Date().getFullYear();

  functions.logger.info(
    'Creating notifications for all birthdays in target year',
    { targetYear }
  );

  const firestore = getFirestore();

  const birthdays = await firestore
    .collection(FireCollection.birthdays)
    .get()
    .then((r) => firestoreSnapshotListToData<BirthdayDocument>(r.docs));

  let totalNotificationsCreated = 0;

  await batchMany(birthdays, async (batch, birthday) => {
    if (birthday.notificationSettings) {
      const createdForBirthdayCount = await createNotificationDocsWithinBatch(
        batch,
        birthday.id,
        birthday.birth,
        birthday.notificationSettings,
        targetYear,
        true
      );

      totalNotificationsCreated += createdForBirthdayCount;
    }
  });

  functions.logger.info('Birthdays processed', {
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
