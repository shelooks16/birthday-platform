import { NotifyBeforePreset } from './notification.types';
import { DeepKeyOf } from './typescript.types';

export interface BirthDate {
  year: number;
  month: number;
  day: number;
}

export interface BirthdayNotificationSettings {
  /** Points to @NotificationChannelDocument */
  notifyChannelsIds: string[];
  /** Formula-based value which indicates when to send "birthday-soon" notifications */
  notifyAtBefore: NotifyBeforePreset[];
  timeZone: string;
}

export interface BirthdayDocument {
  id: string;
  /**
   * Points to @ProfileDocument
   */
  profileId: string;
  buddyName: string;
  buddyDescription?: string;
  birth: BirthDate;
  notificationSettings: BirthdayNotificationSettings | null;
  createdAt: string;
}

export type BirthdayDocumentField = DeepKeyOf<BirthdayDocument>;

export type BirthdayImportExport = Pick<
  BirthdayDocument,
  'buddyName' | 'buddyDescription' | 'birth'
>;
