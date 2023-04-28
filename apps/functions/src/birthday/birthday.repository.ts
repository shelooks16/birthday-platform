import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import {
  BirthdayDocument,
  BirthdayDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';
import { withMemoryCache } from '../utils/memoryCache';

export const birthdayRepo = () =>
  withMemoryCache(
    () =>
      new FireCollectionRepository<BirthdayDocument, BirthdayDocumentField>(
        firestore(),
        FireCollection.birthdays.path()
      ),
    FireCollection.birthdays.docMatch
  );
