import common from '../common';
import home from './home.json';
import dashboard from './dashboard.json';
import validation from './validation.json';
import errors from './errors.json';
import pages from './pages.json';
import signin from './signin.json';

const langs = () => ({
  common: common(),
  home,
  dashboard,
  validation,
  errors,
  pages,
  signin
});

export default langs;
