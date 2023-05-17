import ngrok from 'ngrok';
import got from 'got';
import runtimeCfg from './env/.runtimeconfig.json' assert { type: 'json' };
import serviceAccount from './env/service-account.json' assert { type: 'json' };

function log(...args) {
  console.log('[TELEGRAM_BOT_WEBHOOK]', ...args);
}

async function main() {
  const FN_REGION = 'europe-west1';
  const FN_NAME = 'telegramBot';
  const FN_PORT = 5001;
  const BOT_TOKEN = runtimeCfg.telegram.bot_token;
  const PROJECT_ID = serviceAccount.project_id;

  try {
    const url = await ngrok.connect(FN_PORT);
    log('ngrok tunnel up');

    const webhookUrl = `${url}/${PROJECT_ID}/${FN_REGION}/${FN_NAME}`;

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
