import { firestoreSnapshotToData } from '@shared/firestore-utils';
import {
  EmailVerificationDocument,
  EmailVerificationDocumentField,
  FireCollection
} from '@shared/types';
import { typed } from '@shared/typescript-utils';
import { firestore } from '../firestore';

export const getEmailVerificationDoc = (id?: string) => {
  return id
    ? firestore().doc(FireCollection.emailVerification.docPath(id))
    : firestore().collection(FireCollection.emailVerification.path()).doc();
};

export const createEmailVerification = async (
  data: Omit<EmailVerificationDocument, 'id'>
) => {
  return getEmailVerificationDoc().set(data);
};

export const getLatestEmailVerification = async (
  profileId: string,
  email: string
) => {
  return firestore()
    .collection(FireCollection.emailVerification.path())
    .where(typed<EmailVerificationDocumentField>('profileId'), '==', profileId)
    .where(typed<EmailVerificationDocumentField>('email'), '==', email)
    .orderBy(typed<EmailVerificationDocumentField>('createdAt'))
    .limitToLast(1)
    .get()
    .then((r) =>
      r.size === 0
        ? null
        : firestoreSnapshotToData<EmailVerificationDocument>(r.docs[0])
    );
};

export const updateEmailVerificationById = (
  id: string,
  data: Partial<Omit<EmailVerificationDocument, 'id'>>,
  batchOrTransaction?:
    | FirebaseFirestore.WriteBatch
    | FirebaseFirestore.Transaction
) => {
  if (batchOrTransaction) {
    return (batchOrTransaction as FirebaseFirestore.WriteBatch).update(
      getEmailVerificationDoc(id),
      data
    );
  }

  return getEmailVerificationDoc(id).update(data);
};
