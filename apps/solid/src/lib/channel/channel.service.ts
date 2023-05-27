import {
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { resolveCurrentLocale } from '../../i18n.context';
import { asyncLoadFunctions } from '../firebase/loaders';

export const channelService = {
  async sendEmailVerification(
    payload: Omit<SendEmailVerificationPayload, 'locale'>
  ) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendVerification = httpsCallable<
      SendEmailVerificationPayload,
      SendEmailVerificationResult
    >(functions, 'sendEmailVerification');

    return sendVerification({
      ...payload,
      locale: resolveCurrentLocale()
    }).then((result) => result.data);
  },
  async confirmEmailOtp(payload: Omit<ConfirmEmailOtpPayload, 'locale'>) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendGuess = httpsCallable<
      ConfirmEmailOtpPayload,
      ConfirmEmailOtpResult
    >(functions, 'confirmEmailOtp');

    return sendGuess({ ...payload, locale: resolveCurrentLocale() }).then(
      (result) => result.data
    );
  }
};
