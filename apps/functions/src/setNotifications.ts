import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import {
  BirthdayDocument,
  FireCollection,
  FrequencyUnit,
  NotificationDocument
} from '@shared/types';
import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  createOnWriteFunction,
  OnCreateHandler,
  OnDeleteHandler,
  OnUpdateHandler
} from './utils/createFunction';
// todo consider timezone

const calculateNotificationTimestamp = (
  birthdayDate: Date | string,
  frequencyFormula: string
) => {
  const unitValue = parseInt(frequencyFormula, 10);
  const unit = frequencyFormula.replace(/\d/g, '') as FrequencyUnit;

  const timestamp = new Date(birthdayDate);

  switch (unit) {
    case 'd': {
      timestamp.setDate(timestamp.getDate() - unitValue);
      break;
    }
    case 'h': {
      timestamp.setHours(timestamp.getHours() - unitValue);
      break;
    }
    case 'm': {
      timestamp.setMinutes(timestamp.getMinutes() - unitValue);
      break;
    }
    default:
  }

  return timestamp.toISOString();
};

const buildNotificationDocData = (
  birthdayDoc: BirthdayDocument,
  notifyChannel: string,
  frequencyFormula: string
): Omit<NotificationDocument, 'id'> => {
  const birthdayDate = new Date(
    new Date().getFullYear(),
    birthdayDoc.birth.month,
    birthdayDoc.birth.day
  );

  const timestamp = calculateNotificationTimestamp(
    birthdayDate,
    frequencyFormula
  );

  return {
    sourceBirthdayId: birthdayDoc.id,
    notifyChannel,
    notifyAt: timestamp,
    isQueued: false
  };
};

const getNotificationsForBirthday = async (
  firestore: FirebaseFirestore.Firestore,
  birthdayId: string
) => {
  return firestore
    .collection(FireCollection.notifications)
    .where('sourceBirthdayId', '==', birthdayId)
    .get()
    .then((r) =>
      r.docs.map(
        (docSnap) => firestoreSnapshotToData<NotificationDocument>(docSnap)!
      )
    );
};

const deleteNotificationDocsWithinBatch = (
  batch: FirebaseFirestore.WriteBatch,
  firestore: FirebaseFirestore.Firestore,
  notificationDocs: NotificationDocument[]
) => {
  let count = 0;

  notificationDocs.forEach((doc) => {
    batch.delete(
      firestore.collection(FireCollection.notifications).doc(doc.id)
    );

    if (doc.queueDocId) {
      batch.delete(
        firestore
          .collection(FireCollection.sendNotificationQueue)
          .doc(doc.queueDocId)
      );
    }

    count++;
  });

  return count;
};

const createNotificationDocsWithinBatch = (
  batch: FirebaseFirestore.WriteBatch,
  firestore: FirebaseFirestore.Firestore,
  birthdayDoc: BirthdayDocument
) => {
  let count = 0;

  birthdayDoc.notifyAtBefore.forEach((formula) => {
    birthdayDoc.notifyChannels.forEach((channel) => {
      batch.create(
        firestore.collection(FireCollection.notifications).doc(),
        buildNotificationDocData(birthdayDoc, channel, formula)
      );
      count++;
    });
  });

  return count;
};

const onCreate: OnCreateHandler = async (docSnap) => {
  const firestore = getFirestore();
  const birthdayDoc = firestoreSnapshotToData<BirthdayDocument>(docSnap)!;
  const { id } = birthdayDoc;

  functions.logger.info('Creating notifications for birthday', { id });

  const batch = firestore.batch();

  const createCount = createNotificationDocsWithinBatch(
    batch,
    firestore,
    birthdayDoc
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

  const isUnchanged = isBirthDateTheSame && isNotificationTimeTheSame;

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
    firestore,
    birthdayAfter.id
  );

  const batch = firestore.batch();

  deleteNotificationDocsWithinBatch(batch, firestore, currentNotifications);
  const updateCount = createNotificationDocsWithinBatch(
    batch,
    firestore,
    birthdayAfter
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

  const notifications = await getNotificationsForBirthday(firestore, id);

  functions.logger.info('Deleting notifications for birthday', { id });

  const batch = firestore.batch();

  const deleteCount = deleteNotificationDocsWithinBatch(
    batch,
    firestore,
    notifications
  );

  await batch.commit();

  functions.logger.info('Notifications deleted for birthday', {
    id,
    deleteCount
  });
};

export const setNotifications = createOnWriteFunction('birthday/{id}', {
  onCreate,
  onUpdate,
  onDelete
});
