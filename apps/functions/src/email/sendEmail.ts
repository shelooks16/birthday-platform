import { logger } from '../utils/logger';
import { SendEmailData } from '@shared/types';
import { createEmailClient } from './emailClient';
import { appConfig } from '../appConfig';

export const sendEmail = async (options: SendEmailData) => {
  if (appConfig.isDevEnv) {
    logger.warn('Dev environment detected, email will not be sent', {
      emailOptions: options
    });
    return;
  }

  const emailClient = await createEmailClient();

  await emailClient.sendMail(options);
};
