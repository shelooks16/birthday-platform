import * as fnLogger from 'firebase-functions/logger';

export const logger = {
  info: (message: string, data?: Record<string, any>) => {
    fnLogger.info(message, data);
  },
  warn: (message: string, data?: Record<string, any>) => {
    fnLogger.warn(message, data);
  }
};
