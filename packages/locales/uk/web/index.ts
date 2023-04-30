import home from './home.json';
import dashboard from './dashboard.json';
import common from '../common';

export default () => ({
  ...common(),
  home,
  dashboard
});
