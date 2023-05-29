import { Component } from 'solid-js';
import { Router, useRoutes } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import { ThemeProvider } from './theme';
import { routes } from './routes';
import { UserContextProvider } from './lib/user/user.context';
import { UserProfileContextProvider } from './lib/user/user-profile.context';
import { I18nProvider } from './i18n.context';
import PageTitle from './components/PageTitle';
import ExceptionCatcher from './components/ExceptionCatcher';
import GlobalLayout from './components/GlobalLayout';

const App: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <ExceptionCatcher>
      <MetaProvider>
        <ThemeProvider>
          <I18nProvider>
            <PageTitle />
            <Router>
              <UserContextProvider>
                <UserProfileContextProvider>
                  <GlobalLayout>
                    <Routes />
                  </GlobalLayout>
                </UserProfileContextProvider>
              </UserContextProvider>
            </Router>
          </I18nProvider>
        </ThemeProvider>
      </MetaProvider>
    </ExceptionCatcher>
  );
};

export default App;
