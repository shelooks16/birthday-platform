import common from '../common';
import telegramBot from './telegramBot.json';

const langs = () => ({
  ...common(),
  telegramBot
});

export default langs;
