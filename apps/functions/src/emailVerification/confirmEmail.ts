import {
  ChannelType,
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  EmailVerificationDocument,
  NotificationChannelDocument,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { FireCollection } from '@shared/firestore-collections';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import {
  createCallableFunction,
  createOnCreateFunction
} from '../utils/createFunction';
import {
  HttpsErrorFailedPrecondition,
  HttpsErrorInvalidArgument,
  throwIfUnauth
} from '../utils/errors';
import { sendEmail } from '../email/sendEmail';
import { emailVerificationRepo } from './emailVerification.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { profileRepo } from '../profile/profile.repository';
import { useI18n } from '../i18n.context';
import { appConfig } from '../appConfig';

function randomizeInRange(min: number, max: number) {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
}

function generateOTP(length = 6, allowedChars = '0123456789') {
  let otp = '';
  while (otp.length < length) {
    const charIndex = randomizeInRange(0, allowedChars.length - 1);
    otp += allowedChars[charIndex];
  }
  return otp;
}

export const sendEmailVerification =
  createCallableFunction<SendEmailVerificationPayload>(async (req) => {
    const reqAuth = throwIfUnauth(req.auth);

    const userId = reqAuth.uid;
    const data = req.data;

    const profile = await profileRepo().findById(userId);
    const i18n = await useI18n(profile?.locale);

    if (!profile) {
      throw new HttpsErrorFailedPrecondition(i18n.t('errors.profile.notFound'));
    }

    const existingEmailChannel =
      await notificationChannelRepo().findChannelByProfileId(
        userId,
        ChannelType.email,
        data.email
      );

    if (existingEmailChannel) {
      throw new HttpsErrorFailedPrecondition(
        i18n.t('errors.emailVerification.confirmEmail.alreadyVerified', {
          email: existingEmailChannel.value
        })
      );
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const emailVerificationData: Omit<EmailVerificationDocument, 'id'> = {
      createdAt: getTimestamp(),
      email: data.email,
      profileId: userId,
      otp: generateOTP(),
      expiresAt: getTimestamp(expiresAt),
      isSent: false,
      isVerified: false
    };

    await emailVerificationRepo().setOne(emailVerificationData);

    const result: SendEmailVerificationResult = {
      email: emailVerificationData.email,
      expiresAt: emailVerificationData.expiresAt
    };

    return result;
  });

export const processEmailForVerification = createOnCreateFunction(
  FireCollection.emailVerification.docMatch,
  async (createEvent) => {
    const verificationDoc = firestoreSnapshotToData<EmailVerificationDocument>(
      createEvent.data
    )!;

    try {
      const profile = await profileRepo().findById(verificationDoc.profileId);

      if (!profile) {
        throw new Error(`Profile not found: ${verificationDoc.profileId}`);
      }

      const i18n = await useI18n(profile.locale);

      await notificationChannelRepo().runTransaction(async (tr) => {
        emailVerificationRepo().atomicUpdateOne(tr, {
          id: verificationDoc.id,
          isSent: true,
          sentAt: getTimestamp()
        });

        await sendEmail({
          to: verificationDoc.email,
          subject: i18n.t('email.templates.emailVerification.subject'),
          html: i18n.t('email.templates.emailVerification.html', {
            name: profile.displayName,
            otp: verificationDoc.otp
          })
        });
      });
    } catch (err) {
      await emailVerificationRepo().updateOne({
        id: verificationDoc.id,
        error: err.message
      });
    }
  },
  {
    secrets: appConfig.secretsNames.email
  }
);

export const confirmEmailOtp = createCallableFunction<ConfirmEmailOtpPayload>(
  async (req) => {
    const reqAuth = throwIfUnauth(req.auth);

    const userId = reqAuth.uid;
    const data = req.data;

    const profile = await profileRepo().findById(userId);
    const i18n = await useI18n(profile?.locale);

    if (!profile) {
      throw new HttpsErrorFailedPrecondition(i18n.t('errors.profile.notFound'));
    }

    const verification = await emailVerificationRepo()
      .findMany({
        where: [
          ['profileId', '==', userId],
          ['email', '==', data.email]
        ],
        limitToLast: 1,
        orderBy: {
          createdAt: 'asc'
        }
      })
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!verification) {
      throw new HttpsErrorFailedPrecondition(
        i18n.t('errors.emailVerification.notFound')
      );
    }

    if (verification.otp !== data.otpGuess) {
      throw new HttpsErrorInvalidArgument(
        i18n.t('errors.emailVerification.confirmEmail.otpWrong')
      );
    }

    if (getTimestamp() > verification.expiresAt) {
      throw new HttpsErrorInvalidArgument(
        i18n.t('errors.emailVerification.confirmEmail.otpExpired')
      );
    }

    const batch = notificationChannelRepo().batch();

    const createdNotificationChannel: NotificationChannelDocument = {
      id: notificationChannelRepo().getRandomDocId(),
      profileId: verification.profileId,
      type: ChannelType.email,
      value: verification.email,
      displayName: verification.email,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    notificationChannelRepo().atomicSetOne(batch, createdNotificationChannel);
    emailVerificationRepo().atomicUpdateOne(batch, {
      id: verification.id,
      isVerified: true,
      verifiedAt: getTimestamp()
    });

    await batch.commit();

    const result: ConfirmEmailOtpResult = {
      channel: createdNotificationChannel as NotificationChannelDocument
    };

    return result;
  }
);
