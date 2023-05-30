import common from '../common';
import home from './home.json';
import dashboard from './dashboard.json';
import validation from './validation.json';
import errors from './errors.json';
import pages from './pages.json';

const langs = () => ({
  common: common(),
  home,
  dashboard,
  validation,
  errors,
  pages
});

export default langs;
