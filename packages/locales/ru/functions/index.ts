import common from '../common';
import telegramBot from './telegramBot.json';
import email from './email.json';
import errors from './errors.json';

const langs = () => ({
  common: common(),
  telegramBot,
  email,
  errors
});

export default langs;
