import * as functions from 'firebase-functions';
import { I18nFunctions } from '../i18n.context';

export function requireAuth(
  ctx: functions.https.CallableContext,
  i18n: I18nFunctions
) {
  if (!ctx.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      i18n.t('errors.authRequired')
    );
  }
}
