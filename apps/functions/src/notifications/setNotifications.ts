import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import {
  BirthdayDocument,
  FireCollection,
  FrequencyUnit,
  NotificationDocument
} from '@shared/types';
import {
  firestoreSnapshotListToData,
  firestoreSnapshotToData,
  getTimestamp
} from '@shared/firestore-utils';
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
import { getTimezoneOffset } from '../utils/timezone';

const calculateNotificationTimestamp = (
  birthday: BirthdayDocument,
  frequencyFormula: string,
  targetYear: number
) => {
  const unitValue = parseInt(frequencyFormula, 10);
  const unit = frequencyFormula.replace(/\d/g, '') as FrequencyUnit;

  const timestamp = new Date(
    targetYear,
    birthday.birth.month,
    birthday.birth.day
  );

  const offsetInMin =
    timestamp.getTimezoneOffset() +
    getTimezoneOffset(birthday.notifyTimeZone, timestamp);

  timestamp.setTime(timestamp.getTime() - offsetInMin * 60 * 1000);

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
  if (timestamp.getFullYear() - targetYear === -1) {
    timestamp.setFullYear(targetYear);
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
  birthdayDoc: BirthdayDocument,
  year: number,
  checkForDuplicates = false
) => {
  const firestore = getFirestore();

  let count = 0;

  // wth, no wayyyeee
  await Promise.all(
    birthdayDoc.notifyChannels.map(async (channel) => {
      await Promise.all(
        birthdayDoc.notifyAtBefore.map(async (formula) => {
          const notifyAt = calculateNotificationTimestamp(
            birthdayDoc,
            formula,
            year
          );

          if (notifyAt < getTimestamp()) return;

          const data: Omit<NotificationDocument, 'id'> = {
            sourceBirthdayId: birthdayDoc.id,
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
  const { id } = birthdayDoc;

  functions.logger.info('Creating notifications for birthday', { id });

  const batch = firestore.batch();

  const createCount = await createNotificationDocsWithinBatch(
    batch,
    birthdayDoc,
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

  const isNotificationTimeTheSame =
    Array.from(birthdayBefore.notifyAtBefore).sort().toString() ==
    Array.from(birthdayAfter.notifyAtBefore).sort().toString();

  const isTimeZoneTheSame =
    birthdayBefore.notifyTimeZone == birthdayAfter.notifyTimeZone;

  const isUnchanged =
    isBirthDateTheSame && isNotificationTimeTheSame && isTimeZoneTheSame;

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

  const targetYearForExisting = new Date().getUTCFullYear();

  const currentNotifications = await getNotificationsForBirthday(
    birthdayAfter.id,
    ['isScheduled', '==', false],
    ['isSent', '==', false],
    ['notifyAt', '>=', targetYearForExisting.toString()],
    ['notifyAt', '<=', targetYearForExisting + '\uf8ff']
  );

  const batch = firestore.batch();

  deleteNotificationDocsWithinBatch(batch, currentNotifications);
  const updateCount = await createNotificationDocsWithinBatch(
    batch,
    birthdayAfter,
    new Date().getFullYear()
  );

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
    const createdForBirthdayCount = await createNotificationDocsWithinBatch(
      batch,
      birthday,
      targetYear,
      true
    );

    totalNotificationsCreated += createdForBirthdayCount;
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
