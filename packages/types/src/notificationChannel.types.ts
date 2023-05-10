import { DeepKeyOf } from './typescript.types';

export enum ChannelType {
  email = 'email',
  telegram = 'telegram'
}

export interface NotificationChannelDocument {
  id: string;
  /**
   * Points to @ProfileDocument
   */
  profileId: string;
  type: ChannelType;
  /** Email, telegram chat id */
  value: string | number;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannelDocumentField =
  DeepKeyOf<NotificationChannelDocument>;
