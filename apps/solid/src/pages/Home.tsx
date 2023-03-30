import { Button } from '@hope-ui/solid';
import { Component, Match, Show, Switch } from 'solid-js';
import { useGoogleSignin, useSignOut } from '../user/signin';
import { useUserCtx } from '../user/UserContext';

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
        <Match when={!usrCtx.isLoading}>
          <Show when={usrCtx.user} fallback={<div>Not logged in</div>}>
            <div>Logged in {usrCtx.user?.uid}</div>
          </Show>
        </Match>
      </Switch>
      <Button onClick={handleGoogleLogin}>Login google</Button>
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  );
};

export default Home;
