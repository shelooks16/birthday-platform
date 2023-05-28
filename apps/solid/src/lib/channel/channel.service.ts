import {
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { asyncLoadFunctions } from '../firebase/loaders';

export const channelService = {
  async sendEmailVerification(payload: SendEmailVerificationPayload) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendVerification = httpsCallable<
      SendEmailVerificationPayload,
      SendEmailVerificationResult
    >(functions, 'sendEmailVerification');

    return sendVerification(payload).then((result) => result.data);
  },
  async confirmEmailOtp(payload: ConfirmEmailOtpPayload) {
    const { functions, httpsCallable } = await asyncLoadFunctions();

    const sendGuess = httpsCallable<
      ConfirmEmailOtpPayload,
      ConfirmEmailOtpResult
    >(functions, 'confirmEmailOtp');

    return sendGuess(payload).then((result) => result.data);
  }
};
