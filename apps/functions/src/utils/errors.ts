import * as fnHttps from 'firebase-functions/v2/https';

export function throwIfUnauth(authData?: fnHttps.CallableRequest['auth']) {
  if (!authData) {
    throw new fnHttps.HttpsError('unauthenticated', 'Unauthenticated');
  }

  return authData;
}

export class HttpsErrorFailedPrecondition extends fnHttps.HttpsError {
  constructor(message: string) {
    super('failed-precondition', message);
  }
}

export class HttpsErrorInvalidArgument extends fnHttps.HttpsError {
  constructor(message: string) {
    super('invalid-argument', message);
  }
}

export class HttpsErrorInternal extends fnHttps.HttpsError {
  constructor(message: string) {
    super('internal', message);
  }
}
