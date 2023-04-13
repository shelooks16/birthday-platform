import { logger } from '../utils/logger';
import { getFirestore } from 'firebase-admin/firestore';
import {
  createDebugHttpFn,
  createScheduledFunction
} from '../utils/createFunction';
import { getTimestamp } from '@shared/firestore-utils';
import { FireCollection, NotificationDocument } from '@shared/types';
import { getNotifications } from './queries';

const scheduleSingleNotification = async (
  notification: NotificationDocument
): Promise<boolean> => {
  const firestore = getFirestore();

  const updateForNotification: Partial<NotificationDocument> = {
    isScheduled: true
  };

  try {
    await firestore
      .collection(FireCollection.notifications)
      .doc(notification.id)
      .update(updateForNotification);

    return true;
  } catch (err) {
    logger.warn('Failed to schedule notification', err);

    return false;
  }
};

async function checkNotifications() {
  logger.info('Checking notifications to be sent');

  const notifications = await getNotifications(
    ['isScheduled', '==', false],
    ['notifyAt', '>=', new Date().getUTCFullYear().toString()],
    ['notifyAt', '<=', getTimestamp()]
  );

  let totalScheduled = 0;

  await Promise.all(
    notifications.map(async (n) => {
      const isScheduled = await scheduleSingleNotification(n);

      if (isScheduled) {
        totalScheduled++;
      }
    })
  );

  logger.info('Notifications processed', {
    totalProcessed: notifications.length,
    totalNotScheduled: notifications.length - totalScheduled,
    totalScheduled
  });

  return notifications;
}

export const scheduleNotifications = createScheduledFunction(
  'every 15 minutes',
  async () => {
    await checkNotifications();
  }
);

export const debugScheduleNotifications = createDebugHttpFn(async () => {
  return checkNotifications();
});
