import home from './home.json';
import dashboard from './dashboard.json';
import validation from './validation.json';
import common from '../common';

const langs = () => ({
  common: common(),
  home,
  dashboard,
  validation
});

export default langs;
