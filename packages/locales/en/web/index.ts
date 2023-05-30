import common from '../common';
import home from './home.json';
import dashboard from './dashboard.json';
import validation from './validation.json';
import errors from './errors.json';
import pages from './pages.json';
import signin from './signin.json';
import previewMode from './previewMode.json';
import birthday from './birthday.json';
import timezonePicker from './timezonePicker.json';
import notificationChannel from './notificationChannel.json';
import profile from './profile.json';

const langs = () => ({
  common: common(),
  home,
  dashboard,
  validation,
  errors,
  pages,
  signin,
  previewMode,
  birthday,
  timezonePicker,
  notificationChannel,
  profile
});

export default langs;
