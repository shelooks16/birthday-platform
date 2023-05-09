import { DeepKeyOf } from '@shared/typescript-utils';

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
}

export type NotificationChannelDocumentField =
  DeepKeyOf<NotificationChannelDocument>;
