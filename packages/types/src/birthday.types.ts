import { DeepKeyOf } from './typescript.types';

export interface BirthDate {
  year: number;
  month: number;
  day: number;
}

export interface BirthdayNotificationSettings {
  /** Points to @NotificationChannelDocument */
  notifyChannelsIds: string[];
  notifyAtBefore: string[];
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

export interface GenerateBirthdayWishPayload {
  birthdayId: string;
  language?: string;
}

export interface GenerateBirthdayWishResult {
  text?: string;
}
