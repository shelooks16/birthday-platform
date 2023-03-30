export type FrequencyUnit = 'm' | 'h' | 'd';
export type NotifyFrequency = '30m' | '1h' | '6h' | '1d' | '3d' | '7d';

export type NotificationChannel = 'email';

export type BirthdayDocument = {
  id: string;
  userId: string;
  buddyName: string;
  buddyDescription?: string;
  birth: {
    year: number;
    month: number;
    day: number;
  };
  notifyChannels: string[];
  notifyAtBefore: NotifyFrequency[];
  updatedAt: string;
  createdAt: string;
};

export type NotificationDocument = {
  id: string;
  /**
   * Points to @BirthdayDocument
   */
  sourceBirthdayId: string;
  notifyAt: string;
  notifyChannels: string[];
  /**
   * Map keys are `notifyChannels`. Map values point to @SendNotificationDocument
   */
  queuedNotifyChannels?: Record<string, string>;
};

export type SendEmailData = {
  to: string | string[];
  subject: string;
  html: string;
};

export type SendNotificationDocument = {
  id: string;
  /**
   * Points to @NotificationDocument
   */
  sourceNotificationId: string;
  createdAt: string;
  channel: NotificationChannel;
  data: SendEmailData;
  isSent: boolean;
  sentAt?: string;
};

export enum FireCollection {
  birthdays = 'birthday',
  notifications = 'notification',
  sendNotificationQueue = 'sendNotificationQueue'
}
