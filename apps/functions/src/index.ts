import 'firebase-functions';
import path from 'node:path';
import { initializeApp } from 'firebase-admin/app';
import { isEmulator } from './utils/emulator';

if (isEmulator) {
  process.env['GOOGLE_APPLICATION_CREDENTIALS'] = path.join(
    __dirname,
    '../../../service-account.dev.json'
  );
}

initializeApp();

export {
  checkNotifications,
  debugCheckNotifications
} from './checkNotifications';

export { setNotifications } from './setNotifications';
