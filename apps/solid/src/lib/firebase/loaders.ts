import { appConfig } from '../../appConfig';
import { throwIfPreviewMode } from '../previewMode/preview-mode.context';

declare global {
  interface Window {
    __authEmulator__?: boolean;
    __firestoreEmulator__?: boolean;
    __functionsEmulator__?: boolean;
  }
}

export const asyncLoadAuth = async () => {
  throwIfPreviewMode();

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
  throwIfPreviewMode();

  const mod = await import('./functions');

  if (appConfig.isDevEnv && !window.__functionsEmulator__) {
    mod.connectFunctionsEmulator(mod.functions, 'localhost', 5001);
    window.__functionsEmulator__ = true;
  }

  return mod;
};

export const asyncLoadFirestore = async () => {
  throwIfPreviewMode();

  const mod = await import('./firestore');

  if (appConfig.isDevEnv && !window.__firestoreEmulator__) {
    mod.connectFirestoreEmulator(mod.firestore, 'localhost', 8080);
    window.__firestoreEmulator__ = true;
  }

  return mod;
};
