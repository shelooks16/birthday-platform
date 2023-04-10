import { secrets } from '../config';

export const createEmailCleint = async () => {
  const nodemailer = await import('nodemailer');

  const c = secrets.mailclient;

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
