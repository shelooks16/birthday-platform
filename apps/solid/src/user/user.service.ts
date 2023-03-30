import type { NextOrObserver, ErrorFn, CompleteFn, User } from 'firebase/auth';
import { isMobileView } from '../lib/browser';
import { asyncLoadAuth } from '../lib/firebase';

export const userService = {
  async signinWithGoogle() {
    const [auth, { signInWithRedirect, signInWithPopup, GoogleAuthProvider }] =
      await asyncLoadAuth();

    const login = isMobileView() ? signInWithRedirect : signInWithPopup;

    return login(auth, new GoogleAuthProvider());
  },
  async onAuthStateChanged(
    nextOrObserver: NextOrObserver<User>,
    error?: ErrorFn,
    completed?: CompleteFn
  ) {
    const [auth] = await asyncLoadAuth();

    return auth.onAuthStateChanged(nextOrObserver, error, completed);
  },
  async signOut() {
    const [auth] = await asyncLoadAuth();

    return auth.signOut();
  },
  async getRedirectResult() {
    const [auth, { getRedirectResult }] = await asyncLoadAuth();

    return getRedirectResult(auth);
  }
};
