import { DeepKeyOf } from './typescript.types';

export interface BirthdayWishDocument {
  id: string;
  createdAt: string;
  /**
   * Points to @BirthdayId
   */
  birthdayId: string;
  /**
   * Year for which wish generated
   */
  year: number;
  /** Generated wish */
  wish: string;
}

export type BirthdayWishDocumentField = DeepKeyOf<BirthdayWishDocument>;

export interface GenerateBirthdayWishPayload {
  birthdayId: string;
  /**
   * When `true`, clamp birthdays to generation limit. If limit was already reached, just get wishes.
   *
   * When `false`, generating more than allowed limit will throw an error.
   *
   * @default false
   * */
  clampToLimit?: boolean;
  locale?: string;
}

export interface GenerateBirthdayWishResult {
  wishes: string[];
  year: number;
  generatedCount: number;
  generateMaxCount: number;
}
