type NotifyFrequency = "30m" | "1h" | "6h" | "1d" | "3d" | "7d";

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
