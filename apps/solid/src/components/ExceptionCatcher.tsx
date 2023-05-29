import {
  ErrorBoundary,
  ParentComponent,
  Component,
  createEffect
} from 'solid-js';
import { appConfig } from '../appConfig';
import { resolveCurrentI18nInstance } from '../i18n.context';

const ErrorFallback: Component<{ error: any }> = (props) => {
  createEffect(() => {
    async function sendToSentry() {
      if (!appConfig.env.sentry.dsn) return;

      const sentry = await import('@sentry/browser');

      sentry.init({
        dsn: appConfig.env.sentry.dsn,
        environment: appConfig.env.sentry.environment,
        debug: appConfig.isDevEnv
      });

      const exception =
        props.error instanceof Error
          ? props.error
          : new Error(JSON.stringify(props.error));

      sentry.captureException(exception);
    }

    sendToSentry();
  });

  const i18n = resolveCurrentI18nInstance();

  return (
    <div style={{ 'text-align': 'center', padding: '20px' }}>
      <h1 style={{ 'font-size': '23px' }}>
        {i18n?.t?.('errors.globalException.title') ?? 'Oops, page crash'}
      </h1>
      <div style={{ margin: '20px 0' }}>
        <b>{props.error.message ?? props.error}</b>
      </div>
      <div>
        {i18n?.t?.('errors.globalException.description') ??
          'Error was recorded. Try refreshing the page.'}
      </div>
    </div>
  );
};

const ExceptionCatcher: ParentComponent = (props) => {
  return (
    <ErrorBoundary fallback={(error) => <ErrorFallback error={error} />}>
      {props.children}
    </ErrorBoundary>
  );
};

export default ExceptionCatcher;
