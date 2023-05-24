import { Component, Suspense } from 'solid-js';
import { Router, useRoutes } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import { ThemeProvider } from './theme';
import { routes } from './routes';
import { UserContextProvider } from './lib/user/user.context';
import { UserProfileContextProvider } from './lib/user/user-profile.context';
import { I18nProvider } from './i18n.context';
import PageTitle from './components/PageTitle';
import ExceptionCatcher from './components/ExceptionCatcher';

const App: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <ExceptionCatcher>
      <MetaProvider>
        <I18nProvider>
          <PageTitle />
          <Router>
            <Suspense>
              <ThemeProvider>
                <UserContextProvider>
                  <UserProfileContextProvider>
                    <Routes />
                  </UserProfileContextProvider>
                </UserContextProvider>
              </ThemeProvider>
            </Suspense>
          </Router>
        </I18nProvider>
      </MetaProvider>
    </ExceptionCatcher>
  );
};

export default App;
