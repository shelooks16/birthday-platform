import { ChannelType, NotificationChannelDocument } from '@shared/types';
import { asyncLoadAuth } from '../firebase/loaders';

export const notificationChannelService = {
  async db() {
    return import('./notificationChannel.repository').then(
      (mod) => mod.notificationChannelRepo
    );
  },
  async deleteById(id: string) {
    const db = await this.db();

    await db.deleteById(id);
  },
  async findForProfile(profileId: string) {
    const db = await this.db();

    return db.findMany({ where: [['profileId', '==', profileId]] });
  },
  async $findLatestUpdatedChannelForMyProfile(
    channelType: ChannelType,
    listener: (channel: NotificationChannelDocument) => void,
    onError?: (error: Error) => void
  ) {
    const now = new Date().toISOString();

    const { auth } = await asyncLoadAuth();
    const db = await this.db();

    return db.$findMany(
      {
        where: [
          ['profileId', '==', auth.currentUser!.uid],
          ['type', '==', channelType],
          ['updatedAt', '>', now]
        ],
        orderBy: { updatedAt: 'asc' },
        limitToLast: 1
      },
      (channels) => {
        const channel = channels[0];

        if (channel) {
          listener(channel);
        }
      },
      onError
    );
  }
};
