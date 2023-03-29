import { Component, Suspense } from "solid-js";
import { A, Router, useRoutes } from "@solidjs/router";
import { HopeProvider } from "@hope-ui/solid";
import { routes } from "./routes";

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
          <Routes />
        </HopeProvider>
      </Suspense>
    </Router>
  );
};

export default App;
