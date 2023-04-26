import * as functions from 'firebase-functions';
import {
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { requireAuth } from '../utils/auth';
import { createCallableFunction } from '../utils/createFunction';
import { getBirthdayById } from './queries';
import { createCompletion } from '../openai/completion';

const langMap = {
  en: 'english',
  ru: 'russian'
};

export const generateBirthdayWish = createCallableFunction(
  async (data: GenerateBirthdayWishPayload, ctx) => {
    requireAuth(ctx);

    const birthday = await getBirthdayById(data.birthdayId);

    if (!birthday) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Birthday does not exist'
      );
    }

    const prompt = `Write birthday congratulations for ${
      birthday!.buddyName
    } in ${langMap[data.language ?? 'en']}`;

    const completionResult = await createCompletion(prompt);

    const result: GenerateBirthdayWishResult = {
      text: completionResult[0].text
    };

    return result;
  }
);
