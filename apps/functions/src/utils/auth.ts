import * as functions from 'firebase-functions';

export function requireAuth(ctx: functions.https.CallableContext) {
  if (!ctx.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }
}
