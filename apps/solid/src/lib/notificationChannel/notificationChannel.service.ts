export const notificationChannelService = {
  async db() {
    return import('./notificationChannel.repository').then(
      (mod) => mod.notificationChannelRepo
    );
  }
};
