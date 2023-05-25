import common from '../common';
import telegramBot from './telegramBot.json';
import email from './email.json';

const langs = () => ({
  ...common(),
  telegramBot,
  email
});

export default langs;
