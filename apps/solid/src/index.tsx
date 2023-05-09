/* @refresh reload */
import { render } from 'solid-js/web';
import { appConfig } from './appConfig';
import App from './App';

const root = document.getElementById('root');

if (appConfig.isDevEnv && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?'
  );
}

render(() => <App />, root as any);
