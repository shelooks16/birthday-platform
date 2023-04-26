import { DeepKeyOf } from '@shared/typescript-utils';

export interface EmailVerificationDocument {
  id: string;
  createdAt: string;
  /**
   * Points to @NotificationDocument
   */
  userId: string;
  email: string;
  otp: string;
  expiresAt: string;
  isSent: boolean;
  sentAt?: string;
  isVerified: boolean;
  verifiedAt?: string;
  /** Latest error message during sending verification if any */
  error?: string;
}

export type EmailVerificationDocumentField =
  DeepKeyOf<EmailVerificationDocument>;

export interface SendEmailVerificationPayload {
  email: string;
}

export interface SendEmailVerificationResult {
  email: string;
  expiresAt: string;
}

export interface ConfirmEmailOtpPayload {
  email: string;
  otpGuess: string;
}

export interface ConfirmEmailOtpResult {
  isVerified: boolean;
  email: string;
}
