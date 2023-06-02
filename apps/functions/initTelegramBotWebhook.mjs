import ngrok from 'ngrok';
import got from 'got';
import fs from 'node:fs';
import serviceAccount from './env/service-account.json' assert { type: 'json' };

const parseEnvFile = (path) => {
  const secretLocal = fs.readFileSync(path).toString();

  const obj = {};

  secretLocal
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line) => {
      const f = line.split('=');
      const key = f[0];

      if (key) {
        const value = f[1].replace(/\s/g, '');
        obj[key] = value;
      }
    });

  return obj;
};

async function getSetWebhookParams() {
  const FN_REGION = 'europe-west1';
  const FN_NAME = 'telegramBot';
  const FN_PORT = 5001;
  const BOT_TOKEN = parseEnvFile('./env/.secret.local').TELEGRAM_BOT_TOKEN;
  const PROJECT_ID = serviceAccount.project_id;

  const url = await ngrok.connect(FN_PORT);
  log('ngrok tunnel up');

  const webhookUrl = `${url}/${PROJECT_ID}/${FN_REGION}/${FN_NAME}`;

  return { BOT_TOKEN, webhookUrl };
}

function log(...args) {
  console.log('[TELEGRAM_BOT_WEBHOOK]', ...args);
}

async function main() {
  try {
    const { BOT_TOKEN, webhookUrl } = await getSetWebhookParams();

    const result = await got
      .get(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`
      )
      .json();

    log(result);
  } catch (err) {
    log('Error', err.message);
    await ngrok.kill();
    log('ngrok tunnel stopped');
  }
}

main();
