/* eslint-disable no-undef */
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

function createLogger(prefix) {
  return {
    success: (...args) => console.log('✅', prefix, ...args),
    error: (...args) => console.log('❌', prefix, ...args),
    info: (...args) => console.log('⚙️ ', prefix, ...args),
    raw: (...args) => console.log(prefix, ...args)
  };
}

function setupFunctions() {
  const runtimeCfg = path.resolve('apps/functions/env/.runtimeconfig.json');
  const serviceAcc = path.resolve('apps/functions/env/service-account.json');
  const serviceAccExample = path.resolve(
    'apps/functions/env/service-account.example.json'
  );

  const log = createLogger('functions:');

  log.raw('Runtime config', runtimeCfg);

  if (fs.existsSync(runtimeCfg)) {
    log.info('Skipping. Runtime config already exists');
  } else {
    try {
      execSync(`firebase functions:config:get > ${runtimeCfg}`);
      log.success('Pulled runtime config from functions');
    } catch (error) {
      log.error('Error', error.message);
    }
  }

  log.raw('Service account', serviceAcc);

  if (fs.existsSync(serviceAcc)) {
    log.info('Skipping. Service account already exists');
  } else {
    fs.copyFileSync(serviceAccExample, serviceAcc);
    log.success(
      'Created empty service account file. Download actual service account from Google Cloud Console'
    );
  }
}

function setupWeb() {
  const envFile = path.resolve('apps/solid/.env');
  const envExampleFile = path.resolve('apps/solid/.env.example');

  const log = createLogger('web:');

  log.raw('Env file', envFile);

  if (fs.existsSync(path.resolve(envFile))) {
    log.info('Skipping. Env file already exists');
  } else {
    fs.copyFileSync(envExampleFile, envFile);
    log.success(
      'Env file created from env.example. Fill in env variables inside.'
    );
  }
}

function main() {
  console.log('Setting up environment files');

  setupFunctions();
  setupWeb();
}

main();
