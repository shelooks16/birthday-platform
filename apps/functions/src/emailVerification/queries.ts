import {
  EmailVerificationDocument,
  EmailVerificationDocumentField,
  FireCollection
} from '@shared/types';
import { typed } from '@shared/typescript-utils';
import { firestore } from '../firestore';

export const getEmailVerificationDoc = (id: string) => {
  return firestore().doc(FireCollection.emailVerification.docPath(id));
};

export const createEmailVerification = async (
  data: Omit<EmailVerificationDocument, 'id'>
) => {
  return firestore()
    .collection(FireCollection.emailVerification.path())
    .add(data);
};

export const getLatestEmailVerification = async (
  userId: string,
  email: string
): Promise<EmailVerificationDocument | null> => {
  return firestore()
    .collection(FireCollection.emailVerification.path())
    .where(typed<EmailVerificationDocumentField>('userId'), '==', userId)
    .where(typed<EmailVerificationDocumentField>('email'), '==', email)
    .orderBy(typed<EmailVerificationDocumentField>('createdAt'))
    .limitToLast(1)
    .get()
    .then((r) => r[0] ?? null);
};
