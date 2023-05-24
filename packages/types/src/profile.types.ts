import { DeepKeyOf } from './typescript.types';

export interface ProfileDocument {
  id: string;
  createdAt: string;
  displayName: string;
  /** Profile secret to pair with chat bots */
  botPairingCode: string;
  /** Default timezone to use for notifications */
  timeZone?: string;
  /** User language preference for website and notifications. See `locales` package */
  locale?: string;
}

export type ProfileDocumentField = DeepKeyOf<ProfileDocument>;
