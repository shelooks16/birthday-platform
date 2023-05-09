import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import { MemoryCache } from '@shared/memory-cache';
import {
  ProfileDocument,
  ProfileDocumentField,
  FireCollection
} from '@shared/types';
import { firestore } from '../firestore';

class ProfileRepo extends FireCollectionRepository<
  ProfileDocument,
  ProfileDocumentField
> {
  constructor(fire: FirebaseFirestore.Firestore) {
    super(fire, FireCollection.profiles.path());
  }

  async findByBotPairingCode(botPairingCode: string) {
    return this.findMany({
      where: [['botPairingCode', '==', botPairingCode]],
      limit: 1
    }).then((r) => (r.length > 0 ? r[0] : null));
  }
}

export const profileRepo = () =>
  MemoryCache.getOrSet(
    FireCollection.profiles.docMatch,
    () => new ProfileRepo(firestore())
  );
