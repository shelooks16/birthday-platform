import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { FireCollection } from '@shared/firestore-collections';
import { MemoryCache } from '@shared/memory-cache';
import {
  EmailVerificationDocument,
  EmailVerificationDocumentField
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
