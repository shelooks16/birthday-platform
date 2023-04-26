export * from './birthday.types';
export * from './email.types';
export * from './emailVerification.types';
export * from './notification.types';
export * from './profile.types';
export * from './telegramBot.types';

export const FireCollection = {
  profiles: {
    docMatch: 'profile/{id}',
    path: () => 'profile',
    docPath: (id: string) => `profile/${id}`
  },
  birthdays: {
    docMatch: 'birthday/{id}',
    path: () => 'birthday',
    docPath: (id: string) => `birthday/${id}`
  },
  notifications: {
    docMatch: 'notification/{id}',
    path: () => 'notification',
    docPath: (id: string) => `notification/${id}`
  },
  emailVerification: {
    docMatch: 'emailVerification/{id}',
    path: () => 'emailVerification',
    docPath: (id: string) => `emailVerification/${id}`
  }
};
