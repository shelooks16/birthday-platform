import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import { appConfig } from '../appConfig';

declare global {
  interface Window {
    __authEmulator__?: boolean;
    __firestoreEmulator__?: boolean;
    __functionsEmulator__?: boolean;
  }
}

const firebaseApp = initializeApp(appConfig.env.firebaseConfig);

let cachedAuth: Auth;
let cachedFirestore: Firestore;
let cachedFunctions: Functions;

export async function asyncLoadAuth(): Promise<
  [Auth, typeof import('firebase/auth')]
> {
  const authSDK = await import('firebase/auth');

  if (cachedAuth) {
    return [cachedAuth, authSDK];
  }

  cachedAuth = authSDK.getAuth(firebaseApp);

  if (appConfig.isDevEnv && !window.__authEmulator__) {
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

  if (appConfig.isDevEnv && !window.__firestoreEmulator__) {
    firestoreSDK.connectFirestoreEmulator(cachedFirestore, 'localhost', 8080);
    window.__firestoreEmulator__ = true;
  }

  return [cachedFirestore, firestoreSDK];
}

export async function asyncLoadFunctions(): Promise<
  [Functions, typeof import('firebase/functions')]
> {
  const functionsSDK = await import('firebase/functions');

  if (cachedFunctions) {
    return [cachedFunctions, functionsSDK];
  }

  cachedFunctions = functionsSDK.getFunctions(firebaseApp, 'europe-west1');

  if (appConfig.isDevEnv && !window.__functionsEmulator__) {
    functionsSDK.connectFunctionsEmulator(cachedFunctions, 'localhost', 5001);
    window.__functionsEmulator__ = true;
  }

  return [cachedFunctions, functionsSDK];
}
