import 'firebase-functions';
import path from 'node:path';
import { initializeApp } from 'firebase-admin/app';
import { appConfig } from './appConfig';

if (appConfig.isDevEnv) {
  process.env['GOOGLE_APPLICATION_CREDENTIALS'] = path.join(
    __dirname,
    'service-account.json'
  );
}

initializeApp();

export * from './profile';
export * from './birthdayWish';
export * from './emailVerification';
export * from './notifications';
export * from './notificationChannel';
export * from './telegram';
