import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type {
  Firestore,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

declare global {
  interface Window {
    __authEmulator__?: boolean;
    __firestoreEmulator__?: boolean;
  }
}

const isDev = import.meta.env.DEV;

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyC_OZjooCUX-8HoSVBX_Zq_VtFV0MPYh5E',
  authDomain: 'birthday-dev-c2151.firebaseapp.com',
  projectId: 'birthday-dev-c2151',
  storageBucket: 'birthday-dev-c2151.appspot.com',
  messagingSenderId: '14841017226',
  appId: '1:14841017226:web:499cfe54006e383fa10e73'
});

let cachedAuth: Auth;
let cachedFirestore: Firestore;

export async function asyncLoadAuth(): Promise<
  [Auth, typeof import('firebase/auth')]
> {
  const authSDK = await import('firebase/auth');

  if (cachedAuth) {
    return [cachedAuth, authSDK];
  }

  cachedAuth = authSDK.getAuth(firebaseApp);

  if (isDev && !window.__authEmulator__) {
    authSDK.connectAuthEmulator(cachedAuth, `http://localhost:9099`, {
      disableWarnings: true
    });
    window.__authEmulator__ = true;
  }

  return [cachedAuth, authSDK];
}

export async function asyncLoadFirestore(): Promise<
  [Firestore, typeof import('firebase/firestore')]
> {
  const firestoreSDK = await import('firebase/firestore');

  if (cachedFirestore) {
    return [cachedFirestore, firestoreSDK];
  }

  cachedFirestore = firestoreSDK.getFirestore(firebaseApp);

  if (isDev && !window.__firestoreEmulator__) {
    firestoreSDK.connectFirestoreEmulator(cachedFirestore, 'localhost', 8080);
    window.__firestoreEmulator__ = true;
  }

  return [cachedFirestore, firestoreSDK];
}
