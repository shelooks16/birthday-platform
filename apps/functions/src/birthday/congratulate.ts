import * as functions from 'firebase-functions';
import {
  GenerateCongratulationTextPayload,
  GenerateCongratulationTextResult
} from '@shared/types';
import { requireAuth } from '../utils/auth';
import { createCallableFunction } from '../utils/createFunction';
import { getBirthdayById } from './queries';
import { createOpenAiClient } from './openAiClient';

const langMap = {
  en: 'english',
  ru: 'russian'
};

export const generateCongratulationText = createCallableFunction(
  async (data: GenerateCongratulationTextPayload, ctx) => {
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

    const openai = await createOpenAiClient();

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 2048,
      temperature: 1
    });

    const result: GenerateCongratulationTextResult = {
      text: completion.data.choices[0].text
    };

    return result;
  }
);
