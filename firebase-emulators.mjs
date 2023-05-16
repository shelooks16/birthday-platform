/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
import { spawn, exec } from 'node:child_process';

function logger(err, stdout, stderr) {
  console.log(stdout);
  if (stderr) {
    console.log('[STD_ERR]', stderr);
  }
  if (err) {
    console.log('[ERR]', err);
  }
}

function releasePorts(c) {
  exec('npx kill-port 4000 8080 9099 5001 8085', c);
}

async function main() {
  releasePorts(logger);
  const data = './.emulatordb';

  const emulatorsProcess = spawn(
    `firebase emulators:start  --import=${data} --export-on-exit=${data}`,
    {
      shell: true,
      stdio: 'inherit'
    }
  );

  [
    'exit',
    'SIGINT',
    'SIGUSR1',
    'SIGUSR2',
    'uncaughtException',
    'SIGTERM'
  ].forEach((eventType) => {
    process.on(eventType, () => {
      releasePorts();
      emulatorsProcess && emulatorsProcess.kill();
    });
  });
}

main();
