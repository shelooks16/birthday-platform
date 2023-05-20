import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from '../appConfig';

const emailClient = async () => {
  const nodemailer = await import('nodemailer');

  const c = appConfig.env().mailclient;

  return nodemailer.createTransport(
    {
      host: c.host,
      port: parseInt(c.port),
      secure: c.secure === 'true',
      auth: {
        user: c.sender,
        pass: c.password
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: c.secure === 'true'
      }
    },
    {
      from: {
        name: 'Birthday notifier',
        address: c.sender
      }
    }
  );
};

export const createEmailClient = async () =>
  MemoryCache.getOrSet('emailclient', emailClient);
