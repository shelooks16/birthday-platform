import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import {
  BirthdayDocument,
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
    notifyChannels: birthdayDoc.notifyChannels,
    notifyAt: timestamp
  };
};

const getNotificationsForBirthday = async (
  firestore: FirebaseFirestore.Firestore,
  birthdayId: string
) => {
  return firestore
    .collection('notification')
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
  notificationDocs.forEach((doc) => {
    batch.delete(firestore.collection('notification').doc(doc.id));
  });
};

const createNotificationDocsWithinBatch = (
  batch: FirebaseFirestore.WriteBatch,
  firestore: FirebaseFirestore.Firestore,
  birthdayDoc: BirthdayDocument
) => {
  birthdayDoc.notifyAtBefore.forEach((formula) => {
    batch.create(
      firestore.collection('notification').doc(),
      buildNotificationDocData(birthdayDoc, formula)
    );
  });
};

const onCreate: OnCreateHandler = async (docSnap) => {
  const firestore = getFirestore();
  const birthdayDoc = firestoreSnapshotToData<BirthdayDocument>(docSnap)!;
  const { id, notifyAtBefore } = birthdayDoc;

  functions.logger.info('Creating notifications for birthday', { id });

  const batch = firestore.batch();

  createNotificationDocsWithinBatch(batch, firestore, birthdayDoc);

  await batch.commit();

  functions.logger.info('Notifications created for birthday', {
    id,
    createCount: notifyAtBefore.length
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
  createNotificationDocsWithinBatch(batch, firestore, birthdayAfter);

  await batch.commit();

  functions.logger.info('Updated notifications for birthday', {
    id: birthdayAfter.id,
    updateCount: birthdayAfter.notifyAtBefore.length
  });
};

const onDelete: OnDeleteHandler = async (docSnap) => {
  const firestore = getFirestore();
  const { id } = firestoreSnapshotToData<BirthdayDocument>(docSnap)!;

  const notifications = await getNotificationsForBirthday(firestore, id);

  functions.logger.info('Deleting notifications for birthday', { id });

  const batch = firestore.batch();

  deleteNotificationDocsWithinBatch(batch, firestore, notifications);

  await batch.commit();

  functions.logger.info('Notifications deleted for birthday', {
    id,
    deleteCount: notifications.length
  });
};

export const setNotifications = createOnWriteFunction('birthday/{id}', {
  onCreate,
  onUpdate,
  onDelete
});
