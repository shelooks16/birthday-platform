import type { CreateCompletionRequestPrompt } from 'openai';
import { createOpenAiClient } from './openAiClient';

export const createCompletion = async (
  prompt: CreateCompletionRequestPrompt
) => {
  const openai = await createOpenAiClient();

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 2048,
    temperature: 1
  });

  return completion.data.choices;
};
