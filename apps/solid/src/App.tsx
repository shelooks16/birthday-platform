import { Component, Suspense } from 'solid-js';
import { A, Router, useRoutes } from '@solidjs/router';
import { HopeProvider } from '@hope-ui/solid';
import { routes } from './routes';
import { UserContextProvider } from './user/UserContext';

const App: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <Router>
      <A class="nav" href="/">
        Home
      </A>
      <A class="nav" href="/dash">
        Dash
      </A>
      <Suspense>
        <HopeProvider>
          <UserContextProvider>
            <Routes />
          </UserContextProvider>
        </HopeProvider>
      </Suspense>
    </Router>
  );
};

export default App;
