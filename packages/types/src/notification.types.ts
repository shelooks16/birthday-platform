import { DeepKeyOf } from './typescript.types';

export enum FrequencyUnit {
  months = 'M',
  minutes = 'm',
  hours = 'h',
  days = 'd'
}

export type NotifyFrequency = '30m' | '1h' | '6h' | '1d' | '3d' | '7d' | '1M';

export interface NotificationDocument {
  id: string;
  /**
   * Points to @BirthdayDocument
   */
  sourceBirthdayId: string;
  /**
   * Points to @NotificationChannelDocument
   */
  notificationChannelId: string;
  /**
   * When notification must be sent. ISO format
   */
  notifyAt: string;
  /**
   * Trigger to send the notification. When changes from `false` to `true`, notification is scheduled for sending
   */
  isScheduled: boolean;
  /** Latest error message during sending notification if any */
  error?: string;
  isSent: boolean;
  sentAt?: string;
}

export type NotificationDocumentField = DeepKeyOf<NotificationDocument>;
