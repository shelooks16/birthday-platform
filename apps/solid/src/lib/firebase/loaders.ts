import { appConfig } from '../../appConfig';

declare global {
  interface Window {
    __authEmulator__?: boolean;
    __firestoreEmulator__?: boolean;
    __functionsEmulator__?: boolean;
  }
}

export const asyncLoadAuth = async () => {
  const mod = await import('./auth');

  if (appConfig.isDevEnv && !window.__authEmulator__) {
    mod.connectAuthEmulator(mod.auth, `http://localhost:9099`, {
      disableWarnings: true
    });
    window.__authEmulator__ = true;
  }

  return mod;
};

export const asyncLoadFunctions = async () => {
  const mod = await import('./functions');

  if (appConfig.isDevEnv && !window.__functionsEmulator__) {
    mod.connectFunctionsEmulator(mod.functions, 'localhost', 5001);
    window.__functionsEmulator__ = true;
  }

  return mod;
};

export const asyncLoadFirestore = async () => {
  const mod = await import('./firestore');

  if (appConfig.isDevEnv && !window.__firestoreEmulator__) {
    mod.connectFirestoreEmulator(mod.firestore, 'localhost', 8080);
    window.__firestoreEmulator__ = true;
  }

  return mod;
};
