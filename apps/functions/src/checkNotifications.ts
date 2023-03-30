import * as functions from 'firebase-functions';
import {
  createDebugHttpFn,
  createScheduledFunction
} from './utils/createFunction';

async function notifyUsersIfNeeded() {
  functions.logger.info('hello from notifdy');
}

export const checkNotifications = createScheduledFunction(
  'every 15 seconds',
  async () => {
    await notifyUsersIfNeeded();
  }
);

export const debugCheckNotifications = createDebugHttpFn(async () => {
  return notifyUsersIfNeeded();
});
