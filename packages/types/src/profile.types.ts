import { DeepKeyOf } from './typescript.types';

export interface ProfileDocument {
  id: string;
  createdAt: string;
  displayName: string;
  /** Profile secret to pair with chat bots */
  botPairingCode: string;
  timeZone?: string;
  avatar?: string;
}

export type ProfileDocumentField = DeepKeyOf<ProfileDocument>;
