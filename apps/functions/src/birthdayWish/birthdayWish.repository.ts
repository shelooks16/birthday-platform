import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { FireCollection } from '@shared/firestore-collections';
import { MemoryCache } from '@shared/memory-cache';
import { BirthdayWishDocument, BirthdayWishDocumentField } from '@shared/types';
import { firestore } from '../firestore';

export const birthdayWishRepo = () =>
  MemoryCache.getOrSet(
    FireCollection.birthdayWish.docMatch,
    () =>
      new FireCollectionRepository<
        BirthdayWishDocument,
        BirthdayWishDocumentField
      >(firestore(), FireCollection.birthdayWish.path())
  );
