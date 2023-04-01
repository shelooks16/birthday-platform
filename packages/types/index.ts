export * from './birthday.types';
export * from './email.types';
export * from './notification.types';
export * from './profile.types';

export enum FireCollection {
  profiles = 'profile',
  birthdays = 'birthday',
  notifications = 'notification',
  emailVerification = 'emailVerification'
}
