export type FrequencyUnit = 'm' | 'h' | 'd';
export type NotifyFrequency = '30m' | '1h' | '6h' | '1d' | '3d' | '7d';

export type NotificationChannelType = 'email';

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
   * Indicates whether notification was queued for all channels
   */
  isAllChannelsQueued: boolean;
  /**
   * Map of notifications which are placed to be sent.
   *
   * Map keys are `notifyChannels`. Map values point to @SendNotificationDocument
   */
  queuedNotifications?: Record<string, string>;
  queueErrors?: Record<string, string>;
};

export type SendEmailData = {
  /** Recipient email */
  to: string;
  /** Email subject */
  subject: string;
  /** Markup for the email */
  html: string;
};

export type SendNotificationDocumentData = SendEmailData;

export type SendNotificationDocument = {
  id: string;
  /**
   * Points to @NotificationDocument
   */
  sourceNotificationId: string;
  createdAt: string;
  channelType: NotificationChannelType;
  data: SendNotificationDocumentData;
  isSent: boolean;
  sentAt?: string;
};

export enum FireCollection {
  birthdays = 'birthday',
  notifications = 'notification',
  sendNotificationQueue = 'sendNotificationQueue'
}
