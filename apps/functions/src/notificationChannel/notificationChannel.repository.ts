import { FireCollectionRepository } from '@shared/firestore-admin-utils';
import {
  NotificationChannelDocument,
  NotificationChannelDocumentField,
  FireCollection,
  ChannelType
} from '@shared/types';
import { firestore } from '../firestore';
import { withMemoryCache } from '../utils/memoryCache';

class NotificationChannelRepo extends FireCollectionRepository<
  NotificationChannelDocument,
  NotificationChannelDocumentField
> {
  constructor(fire: FirebaseFirestore.Firestore) {
    super(fire, FireCollection.notificationChannel.path());
  }

  async findChannelByProfileId(
    profileId: string,
    type: ChannelType,
    value: string | number
  ) {
    return this.findMany({
      where: [
        ['profileId', '==', profileId],
        ['type', '==', type],
        ['value', '==', value]
      ],
      limit: 1
    }).then((r) => (r.length > 0 ? r[0] : null));
  }
}

export const notificationChannelRepo = () =>
  withMemoryCache(
    () => new NotificationChannelRepo(firestore()),
    FireCollection.notificationChannel.docMatch
  );
