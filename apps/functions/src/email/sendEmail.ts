import { logger } from '../utils/logger';
import { SendEmailData } from '@shared/types';
import { isEmulator } from '../utils/emulator';
import { createEmailClient } from './emailClient';

export const sendEmail = async (options: SendEmailData) => {
  if (isEmulator) {
    logger.warn('Emulator detected, email will not be sent', {
      emailOptions: options
    });
    return;
  }

  const emailClient = await createEmailClient();

  await emailClient.sendMail(options);
};
