import { NotifyFrequency } from './notification.types';

export interface BirthdayDocument {
  id: string;
  /**
   * Points to @ProfileDocument
   */
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
  notifyTimeZone: string;
  updatedAt: string;
  createdAt: string;
}

export interface GenerateCongratulationTextPayload {
  birthdayId: string;
}

export interface GenerateCongratulationTextResult {
  text?: string;
}
