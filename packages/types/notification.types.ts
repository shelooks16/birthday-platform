import { DeepKeyOf } from '@shared/typescript-utils';

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
  notifyAt: string;
  notifyChannel: string;
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
