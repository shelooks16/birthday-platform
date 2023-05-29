import { Component, Match, Switch } from 'solid-js';
import GoogleSignInBtn from '../components/signin/GoogleSignInBtn';
import SignOutBtn from '../components/signin/SignOutBtn';
import { useUserCtx } from '../lib/user/user.context';

const Home: Component = () => {
  const [usrCtx] = useUserCtx();

  return (
    <div>
      <Switch>
        <Match when={usrCtx.isLoading}>
          <div>...</div>
        </Match>
        <Match when={usrCtx.isSignedOut}>
          <div>Not logged in</div>
        </Match>
        <Match when={usrCtx.user}>
          <div>Logged in {usrCtx.user?.uid}</div>
        </Match>
      </Switch>
      <GoogleSignInBtn />
      <SignOutBtn />
    </div>
  );
};

export default Home;
