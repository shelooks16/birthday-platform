import home from './home.json';
import dashboard from './dashboard.json';
import common from '../common';

const langs = () => ({
  ...common(),
  home,
  dashboard
});

export default langs;
