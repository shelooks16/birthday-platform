import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import {
  EmailVerificationDocument,
  EmailVerificationDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';
import { withMemoryCache } from '../utils/memoryCache';

export const emailVerificationRepo = () =>
  withMemoryCache(
    () =>
      new FireCollectionRepository<
        EmailVerificationDocument,
        EmailVerificationDocumentField
      >(firestore(), FireCollection.emailVerification.path()),
    FireCollection.emailVerification.docMatch
  );
