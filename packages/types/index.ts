export type FrequencyUnit = 'm' | 'h' | 'd';
export type NotifyFrequency = '30m' | '1h' | '6h' | '1d' | '3d' | '7d';

export type NotificationChannelType = 'email';

export interface BirthdayDocument {
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
}

export interface NotificationDocument {
  id: string;
  /**
   * Points to @BirthdayDocument
   */
  sourceBirthdayId: string;
  notifyAt: string;
  notifyChannel: string;
  isQueued: boolean;
  /**
   * Points to @SendNotificationDocument
   */
  queueDocId?: string;
  /**
   * Error if notification fails to be pushed into sending queue
   */
  queueError?: string;
}

export interface SendEmailData {
  /** Recipient email */
  to: string;
  /** Email subject */
  subject: string;
  /** Markup for the email */
  html: string;
}

export type SendNotificationDocumentData = SendEmailData;

export interface SendNotificationDocument {
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
}

export enum FireCollection {
  birthdays = 'birthday',
  notifications = 'notification',
  sendNotificationQueue = 'sendNotificationQueue'
}
