// use different naming to not collide with hope ui's notificationService
export const notificationDataService = {
  async db() {
    return import('./notification.repository').then(
      (mod) => mod.notificationRepo
    );
  }
};
