import { Component } from 'solid-js';
import { Router, useRoutes } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';
import { ThemeProvider } from './theme';
import { routes } from './routes';
import { UserContextProvider } from './lib/user/user.context';
import { UserProfileContextProvider } from './lib/user/user-profile.context';
import { I18nProvider, useI18n } from './i18n.context';
import PageTitle from './components/PageTitle';
import ExceptionCatcher from './components/ExceptionCatcher';
import GlobalLayout from './components/GlobalLayout';
import { PreviewModeContextProvider } from './lib/previewMode/preview-mode.context';

const HomePageTitle = () => {
  const [i18n] = useI18n();

  return <PageTitle>{i18n().t('pages.home.title')}</PageTitle>;
};

const App: Component = () => {
  const Routes = useRoutes(routes);

  return (
    <ExceptionCatcher>
      <MetaProvider>
        <ThemeProvider>
          <I18nProvider>
            <HomePageTitle />
            <Router>
              <PreviewModeContextProvider>
                <UserContextProvider>
                  <UserProfileContextProvider>
                    <GlobalLayout>
                      <Routes />
                    </GlobalLayout>
                  </UserProfileContextProvider>
                </UserContextProvider>
              </PreviewModeContextProvider>
            </Router>
          </I18nProvider>
        </ThemeProvider>
      </MetaProvider>
    </ExceptionCatcher>
  );
};

export default App;
