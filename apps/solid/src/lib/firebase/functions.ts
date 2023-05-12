import { getFunctions } from 'firebase/functions';
import { app } from './app';

export const functions = getFunctions(app, 'europe-west1');

export { httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
