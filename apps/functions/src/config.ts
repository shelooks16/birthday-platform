import * as functions from 'firebase-functions';

interface Secrets {
  mailclient: {
    sender: string;
    password: string;
    host: string;
    port: string;
    secure: 'true' | 'false';
  };
  openai?: {
    secretkey?: string;
  };
}

export const secrets = functions.config() as Secrets;
