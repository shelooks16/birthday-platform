import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { MemoryCache } from '@shared/memory-cache';
import {
  EmailVerificationDocument,
  EmailVerificationDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';

export const emailVerificationRepo = () =>
  MemoryCache.getOrSet(
    FireCollection.emailVerification.docMatch,
    () =>
      new FireCollectionRepository<
        EmailVerificationDocument,
        EmailVerificationDocumentField
      >(firestore(), FireCollection.emailVerification.path())
  );
