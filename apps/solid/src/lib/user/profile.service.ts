export const profileService = {
  async db() {
    return import('./profile.repository').then((mod) => mod.profileRepo);
  }
};
