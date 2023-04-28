import { DeepKeyOf } from '@shared/typescript-utils';

export interface ProfileDocument {
  id: string;
  createdAt: string;
  displayName: string;
  timeZone?: string;
  avatar?: string;
}

export type ProfileDocumentField = DeepKeyOf<ProfileDocument>;
