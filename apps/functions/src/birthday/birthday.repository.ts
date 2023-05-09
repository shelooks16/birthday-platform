import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { FireCollection } from '@shared/firestore-collections';
import { MemoryCache } from '@shared/memory-cache';
import { BirthdayDocument, BirthdayDocumentField } from '@shared/types';
import { firestore } from '../firestore';

export const birthdayRepo = () =>
  MemoryCache.getOrSet(
    FireCollection.birthdays.docMatch,
    () =>
      new FireCollectionRepository<BirthdayDocument, BirthdayDocumentField>(
        firestore(),
        FireCollection.birthdays.path()
      )
  );
