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
  },
  notificationChannel: {
    docMatch: 'notificationChannel/{id}',
    path: () => 'notificationChannel',
    docPath: (id: string) => `notificationChannel/${id}`
  }
};
