import { Button } from '@hope-ui/solid';
import { Component, Match, Switch } from 'solid-js';
import { useGoogleSignin, useSignOut } from '../lib/user/signin';
import { useUserCtx } from '../lib/user/user.context';

const Home: Component = () => {
  const [usrCtx] = useUserCtx();
  const handleGoogleLogin = useGoogleSignin();
  const handleSignOut = useSignOut();

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
      <Button onClick={handleGoogleLogin}>Login google</Button>
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  );
};

export default Home;
