import * as functions from 'firebase-functions';
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
import { requireAuth } from '../utils/auth';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';
import { emailVerificationRepo } from './emailVerification.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';

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

async function throwIfAlreadyVerified(profileId: string, email: string) {
  const existingChannel =
    await notificationChannelRepo().findChannelByProfileId(
      profileId,
      ChannelType.email,
      email
    );

  if (existingChannel) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `${existingChannel.value} already verified`
    );
  }
}

export const sendEmailVerification = createCallableFunction(
  async (data: SendEmailVerificationPayload, ctx) => {
    requireAuth(ctx);
    await throwIfAlreadyVerified(ctx.auth!.uid, data.email);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const emailVerificationData: Omit<EmailVerificationDocument, 'id'> = {
      createdAt: getTimestamp(),
      email: data.email,
      profileId: ctx.auth!.uid,
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
  }
);

export const processEmailForVerification = createOnCreateFunction(
  FireCollection.emailVerification.docMatch,
  async (snap) => {
    const verificationDoc =
      firestoreSnapshotToData<EmailVerificationDocument>(snap)!;

    try {
      await notificationChannelRepo().runTransaction(async (tr) => {
        emailVerificationRepo().atomicUpdateOne(tr, {
          id: verificationDoc.id,
          isSent: true,
          sentAt: getTimestamp()
        });

        await sendEmail({
          to: verificationDoc.email,
          subject: mailTemplate.emailVerification.subject(),
          html: mailTemplate.emailVerification.html({
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
  }
);

export const confirmEmailOtp = createCallableFunction(
  async (data: ConfirmEmailOtpPayload, ctx) => {
    requireAuth(ctx);

    const verification = await emailVerificationRepo()
      .findMany({
        where: [
          ['profileId', '==', ctx.auth!.uid],
          ['email', '==', data.email]
        ],
        limitToLast: 1,
        orderBy: {
          createdAt: 'asc'
        }
      })
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!verification) {
      throw new functions.https.HttpsError(
        'aborted',
        'Email verification does not exist'
      );
    }

    if (verification.otp !== data.otpGuess) {
      throw new functions.https.HttpsError('aborted', 'Wrong OTP');
    }

    if (getTimestamp() > verification.expiresAt) {
      throw new functions.https.HttpsError('aborted', 'Expired');
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
