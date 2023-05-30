import { previewModeProxy } from '../previewMode/preview-mode.context';

// use different naming to not collide with hope ui's notificationService
export const notificationDataService = previewModeProxy({
  async db() {
    return import('./notification.repository').then(
      (mod) => mod.notificationRepo
    );
  },
  async findForProfile(
    profileId: string,
    orderByNotifyAt: 'asc' | 'desc' = 'asc'
  ) {
    const db = await this.db();

    return db.findMany({
      where: [
        ['profileId', '==', profileId],
        ['isSent', '==', false]
      ],
      orderBy: {
        notifyAt: orderByNotifyAt
      }
    });
  }
});
