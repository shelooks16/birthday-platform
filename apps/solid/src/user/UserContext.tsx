import type { User } from "firebase/auth";
import { createStore, reconcile } from "solid-js/store";
import { createContext, onMount, ParentProps, useContext } from "solid-js";
import { userService } from "../lib/user.service";
import { LocalStorage } from "../lib/local-storage";

type UserState = {
  /**
   * Signed in user object.
   */
  user: User | null;
  /**
   * Indicates whether currently handling auth redirect after signin with a
   * social media account.
   */
  isHandlingRedirect: boolean;
  /**
   * Indicates whether still loading user object.
   */
  isLoading: boolean;
  /**
   * Error if user fails to be loaded.
   */
  error: Error | null;
};

type UserStateOps = {
  setUser: (authUser?: User | null, error?: Error | null) => void;
};

type IUserCtx = [UserState, UserStateOps];

export const UserContext = createContext<IUserCtx>();
export const useUserCtx = () => useContext(UserContext) as IUserCtx;

export function UserContextProvider(props: ParentProps) {
  const [state, setState] = createStore<UserState>({
    user: null,
    isHandlingRedirect: false,
    isLoading: true,
    error: null,
  });

  const setUser = (authUser?: User | null, error?: Error | null) => {
    setState(
      reconcile({
        isLoading: false,
        isHandlingRedirect: false,
        error: error ?? null,
        user: authUser ?? null,
      })
    );

    if (authUser) {
      LocalStorage.set("uid", authUser.uid);
    } else {
      LocalStorage.remove("uid");
    }
  };

  onMount(async () => {
    try {
      const unsub = await userService.onAuthStateChanged(
        (authUser) => {
          unsub();
          setUser(authUser);
        },
        (err) => {
          setUser(null, err);
        }
      );
    } catch (err) {
      setUser(null, err);
    }
  });

  const ctx: IUserCtx = [state, { setUser }];

  return (
    <UserContext.Provider value={ctx}>{props.children}</UserContext.Provider>
  );
}
