import { getAuth } from 'firebase/auth';
import { app } from './app';

export const auth = getAuth(app);

export {
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  getAdditionalUserInfo,
  connectAuthEmulator
} from 'firebase/auth';
