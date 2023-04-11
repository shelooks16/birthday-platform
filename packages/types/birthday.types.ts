export interface BirthDate {
  year: number;
  month: number;
  day: number;
}

export interface BirthdayNotificationSettings {
  notifyChannels: string[];
  notifyAtBefore: string[];
  timeZone: string;
}

export interface BirthdayDocument {
  id: string;
  /**
   * Points to @ProfileDocument
   */
  userId: string;
  buddyName: string;
  buddyDescription?: string;
  birth: BirthDate;
  notificationSettings: BirthdayNotificationSettings | null;
  updatedAt: string;
  createdAt: string;
}

export interface GenerateCongratulationTextPayload {
  birthdayId: string;
}

export interface GenerateCongratulationTextResult {
  text?: string;
}
