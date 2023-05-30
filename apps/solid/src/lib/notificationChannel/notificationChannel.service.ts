import {
  ChannelType,
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  NotificationChannelDocument,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { asyncLoadAuth, asyncLoadFunctions } from '../firebase/loaders';
import { previewModeProxy } from '../previewMode/preview-mode.context';

export const notificationChannelService = previewModeProxy({
  async db() {
    return import('./notificationChannel.repository').then(
      (mod) => mod.notificationChannelRepo
    );
  },
  async deleteById(id: string) {
    const db = await this.db();

    await db.deleteById(id);
  },
  async findForProfile(profileId: string) {
    const db = await this.db();

    return db.findMany({ where: [['profileId', '==', profileId]] });
  },
  async $findLatestUpdatedChannelForMyProfile(
    channelType: ChannelType,
    listener: (channel: NotificationChannelDocument) => void,
    onError?: (error: Error) => void
  ) {
    const now = new Date().toISOString();

    const { auth } = await asyncLoadAuth();
    const db = await this.db();

    return db.$findMany(
      {
        where: [
          ['profileId', '==', auth.currentUser!.uid],
          ['type', '==', channelType],
          ['updatedAt', '>', now]
        ],
        orderBy: { updatedAt: 'asc' },
        limitToLast: 1
      },
      (channels) => {
        const channel = channels[0];

        if (channel) {
          listener(channel);
        }
      },
      onError
    );
  },
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
});
