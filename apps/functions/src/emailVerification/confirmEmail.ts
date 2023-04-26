import * as functions from 'firebase-functions';
import {
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  EmailVerificationDocument,
  FireCollection,
  ProfileDocument,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { arrayUnion } from '@shared/firestore-admin-utils';
import { emailChannel } from '@shared/notification-channels';
import {
  createCallableFunction,
  createOnCreateFunction
} from '../utils/createFunction';
import { requireAuth } from '../utils/auth';
import { sendEmail } from '../email/sendEmail';
import { mailTemplate } from '../email/templates';
import { getProfileById, getProfileDocRef } from '../profile/queries';
import {
  createEmailVerification,
  getEmailVerificationDoc,
  getLatestEmailVerification
} from './queries';
import { firestore } from '../firestore';

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

async function throwIfAlreadyVerified(userId: string, email: string) {
  const userProfile = await getProfileById(userId);

  if (!userProfile) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User profile not found'
    );
  }

  if (userProfile.verifiedNotifyChannels.includes(emailChannel.make(email))) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `${email} already verified`
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
      userId: ctx.auth!.uid,
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
        const updates: Partial<EmailVerificationDocument> = {
          isSent: true,
          sentAt: getTimestamp()
        };

        await sendEmail({
          to: verificationDoc.email,
          subject: mailTemplate.emailVerification.subject(),
          html: mailTemplate.emailVerification.html({
            otp: verificationDoc.otp
          })
        });

        tr.update(snap.ref, updates);
      });
    } catch (err) {
      await snap.ref.update({ error: err.message });
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

    const profileUpdates: Partial<ProfileDocument> = {
      verifiedNotifyChannels: arrayUnion<string[]>(
        emailChannel.make(verification.email)
      )
    };

    const verificationUpdates: Partial<EmailVerificationDocument> = {
      isVerified: true,
      verifiedAt: getTimestamp()
    };

    const batch = firestore().batch();

    batch.update(getProfileDocRef(verification.userId), profileUpdates);
    batch.update(getEmailVerificationDoc(verification.id), verificationUpdates);

    await batch.commit();

    const result: ConfirmEmailOtpResult = {
      isVerified: true,
      email: verification.email
    };

    return result;
  }
);
