import * as functions from 'firebase-functions';
import { SendEmailData } from '@shared/types';
import { isEmulator } from '../utils/emulator';
import { emailClient } from './emailClient';

export const sendEmail = async (options: SendEmailData) => {
  if (isEmulator) {
    functions.logger.warn('Emulator detected, email will not be sent', {
      emailOptions: options
    });
    return;
  }

  await emailClient.sendMail(options);
};
