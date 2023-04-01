import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  ConfirmEmailOtpPayload,
  ConfirmEmailOtpResult,
  EmailVerificationDocument,
  FireCollection,
  ProfileDocument,
  SendEmailVerificationPayload,
  SendEmailVerificationResult
} from '@shared/types';
import {
  createCallableFunction,
  createOnCreateFunction
} from '../utils/createFunction';
import { firestoreSnapshotToData, getTimestamp } from '@shared/firestore-utils';
import { sendEmail } from './sendEmail';
import { createEmailChannel } from '@shared/notification-channels';
import { mailTemplate } from './templates';

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

function requireAuth(ctx: functions.https.CallableContext) {
  if (!ctx.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }
}

async function throwIfAlreadyVerified(userId: string, email: string) {
  const firestore = getFirestore();

  const userProfile = await firestore
    .collection(FireCollection.profiles)
    .doc(userId)
    .get()
    .then((r) => firestoreSnapshotToData<ProfileDocument>(r));

  if (!userProfile) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'User profile not found'
    );
  }

  if (userProfile.verifiedNotifyChannels.includes(createEmailChannel(email))) {
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

    const firestore = getFirestore();

    await firestore
      .collection(FireCollection.emailVerification)
      .add(emailVerificationData);

    const result: SendEmailVerificationResult = {
      expiresAt: emailVerificationData.expiresAt
    };

    return result;
  }
);

export const processEmailForVerification = createOnCreateFunction(
  `${FireCollection.emailVerification}/{id}`,
  async (snap) => {
    const verificationDoc =
      firestoreSnapshotToData<EmailVerificationDocument>(snap)!;

    const firestore = getFirestore();

    try {
      await firestore.runTransaction(async (tr) => {
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

    const firestore = getFirestore();

    const verification = await firestore
      .collection(FireCollection.emailVerification)
      .where('userId', '==', ctx.auth!.uid)
      .where('email', '==', data.email)
      .orderBy('createdAt')
      .limitToLast(1)
      .get()
      .then((r) =>
        r.size > 0
          ? firestoreSnapshotToData<EmailVerificationDocument>(r.docs[0])
          : null
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
      verifiedNotifyChannels: FieldValue.arrayUnion(
        createEmailChannel(verification.email)
      ) as any
    };

    const verificationUpdates: Partial<EmailVerificationDocument> = {
      isVerified: true,
      verifiedAt: getTimestamp()
    };

    const batch = firestore.batch();

    batch.update(
      firestore.collection(FireCollection.profiles).doc(verification.userId),
      profileUpdates
    );

    batch.update(
      firestore
        .collection(FireCollection.emailVerification)
        .doc(verification.id),
      verificationUpdates
    );

    await batch.commit();

    const result: ConfirmEmailOtpResult = {
      isVerified: true,
      email: verification.email
    };

    return result;
  }
);
