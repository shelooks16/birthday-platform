import nodemailer from 'nodemailer';
import { secrets } from '../config';

const c = secrets.mailclient;

export const emailClient = nodemailer.createTransport(
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
