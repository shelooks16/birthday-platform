import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from '../appConfig';

const emailClient = async () => {
  const nodemailer = await import('nodemailer');

  const c = appConfig.secrets.mailclient;

  return nodemailer.createTransport(
    {
      host: c.host.value(),
      port: parseInt(c.port.value()),
      secure: c.secure.value() === 'true',
      auth: {
        user: c.sender.value(),
        pass: c.password.value()
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: c.secure.value() === 'true'
      }
    },
    {
      from: {
        name: appConfig.platformName,
        address: c.sender.value()
      }
    }
  );
};

export const createEmailClient = async () =>
  MemoryCache.getOrSet('emailclient', emailClient);
