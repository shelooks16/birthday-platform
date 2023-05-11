import type {
  NextOrObserver,
  ErrorFn,
  CompleteFn,
  User,
  UserCredential
} from 'firebase/auth';
import { isMobileView } from '../browser';
import { asyncLoadAuth } from '../firebase';

export const userService = {
  async getAuthUser(params?: { throwIfNull: boolean }) {
    const [auth] = await asyncLoadAuth();

    if (params?.throwIfNull && !auth.currentUser) {
      throw new Error('User is not logged in');
    }

    return auth.currentUser;
  },
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
  },
  async getAdditionalUserInfo(credential: UserCredential) {
    const [, { getAdditionalUserInfo }] = await asyncLoadAuth();

    return getAdditionalUserInfo(credential);
  }
};
