import * as functions from 'firebase-functions';
import {
  ChannelType,
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  EmailVerificationDocument,
  FireCollection,
  NotificationChannelDocument,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import {
  createCallableFunction,
  createOnCreateFunction
} from '../utils/createFunction';
import { requireAuth } from '../utils/auth';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';
import {
  createEmailVerification,
  getLatestEmailVerification,
  updateEmailVerificationById
} from './queries';
import { firestore } from '../firestore';
import {
  createNotificationChannel,
  findNotificationChannelForProfile
} from '../notificationChannel/queries';

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
  const existingChannel = await findNotificationChannelForProfile(
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

    await createEmailVerification(emailVerificationData);

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
      await firestore().runTransaction(async (tr) => {
        updateEmailVerificationById(
          verificationDoc.id,
          {
            isSent: true,
            sentAt: getTimestamp()
          },
          tr
        );

        await sendEmail({
          to: verificationDoc.email,
          subject: mailTemplate.emailVerification.subject(),
          html: mailTemplate.emailVerification.html({
            otp: verificationDoc.otp
          })
        });
      });
    } catch (err) {
      await updateEmailVerificationById(verificationDoc.id, {
        error: err.message
      });
    }
  }
);

export const confirmEmailOtp = createCallableFunction(
  async (data: ConfirmEmailOtpPayload, ctx) => {
    requireAuth(ctx);

    const verification = await getLatestEmailVerification(
      ctx.auth!.uid,
      data.email
    );

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

    const batch = firestore().batch();

    const createdNotificationChannel = createNotificationChannel(
      {
        profileId: verification.profileId,
        type: ChannelType.email,
        value: verification.email,
        displayName: verification.email,
        createdAt: getTimestamp()
      },
      batch
    );

    updateEmailVerificationById(
      verification.id,
      {
        isVerified: true,
        verifiedAt: getTimestamp()
      },
      batch
    );

    await batch.commit();

    const result: ConfirmEmailOtpResult = {
      channel: createdNotificationChannel as NotificationChannelDocument
    };

    return result;
  }
);
