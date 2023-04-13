import * as functions from 'firebase-functions';

export const logger = {
  info: (message: string, data?: Record<string, any>) => {
    functions.logger.info(message, data);
  },
  warn: (message: string, data?: Record<string, any>) => {
    functions.logger.warn(message, data);
  }
};
