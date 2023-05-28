import type { User } from 'firebase/auth';
import { createStore, produce } from 'solid-js/store';
import {
  createContext,
  onMount,
  ParentProps,
  useContext,
  createEffect
} from 'solid-js';
import { userService } from './user.service';
import { useNavigate } from '@solidjs/router';
import { ROUTE_PATH } from '../../routes';
import { notificationService } from '@hope-ui/solid';

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isSignedOut: boolean;
};

type UserStateOps = {
  setUser: (authUser?: User | null, error?: Error | null) => void;
};

type IUserCtx = [UserState, UserStateOps];

export const UserContext = createContext<IUserCtx>();
export const useUserCtx = () => useContext(UserContext) as IUserCtx;

export const useRedirectIfSignedOut = () => {
  const [userctx] = useUserCtx();
  const navigate = useNavigate();

  createEffect(() => {
    if (userctx.isSignedOut) {
      navigate(ROUTE_PATH.index);
    }
  });
};

export function UserContextProvider(props: ParentProps) {
  const [state, setState] = createStore<UserState>({
    user: null,
    isLoading: true,
    error: null,
    get isSignedOut() {
      return !this.isLoading && !this.user;
    }
  });

  const setUser = (authUser?: User | null, error?: Error | null) => {
    setState(
      produce((s) => {
        s.isLoading = false;
        s.error = error ?? null;
        s.user = authUser ?? null;
      })
    );
  };

  onMount(async () => {
    let unsub: () => void;
    try {
      unsub = await userService.onAuthStateChanged(
        (authUser) => {
          unsub && unsub();
          setUser(authUser);
        },
        (err) => {
          setUser(null, err);
          notificationService.show({
            status: 'danger',
            title: err.message
          });
        }
      );
    } catch (err) {
      setUser(null, err);
      notificationService.show({
        status: 'danger',
        title: err.message
      });
    }
  });

  const ctx: IUserCtx = [state, { setUser }];

  return (
    <UserContext.Provider value={ctx}>{props.children}</UserContext.Provider>
  );
}
