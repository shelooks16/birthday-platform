import type { NextOrObserver, User, UserCredential } from 'firebase/auth';
import { isMobileView } from '../browser';
import { asyncLoadAuth } from '../firebase/loaders';
import { previewModeProxy } from '../previewMode/preview-mode.context';

export const userService = previewModeProxy({
  async signinWithGoogle(defaultLanguage?: string) {
    const { auth, signInWithRedirect, signInWithPopup, GoogleAuthProvider } =
      await asyncLoadAuth();

    const login = isMobileView() ? signInWithRedirect : signInWithPopup;

    const provider = new GoogleAuthProvider();

    if (defaultLanguage) {
      provider.setDefaultLanguage(defaultLanguage.slice(0, 2));
    }

    return login(auth, new GoogleAuthProvider());
  },
  async onAuthStateChanged(nextOrObserver: NextOrObserver<User>) {
    const { auth } = await asyncLoadAuth();

    return auth.onAuthStateChanged(nextOrObserver);
  },
  async signOut() {
    const { auth } = await asyncLoadAuth();

    return auth.signOut();
  },
  async getRedirectResult() {
    const { auth, getRedirectResult } = await asyncLoadAuth();

    return getRedirectResult(auth);
  },
  async getAdditionalUserInfo(credential: UserCredential) {
    const { getAdditionalUserInfo } = await asyncLoadAuth();

    return getAdditionalUserInfo(credential);
  }
});
