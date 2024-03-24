import { createOpenAiClient } from './openAiClient';

export const createCompletion = async (prompt: string): Promise<string> => {
  const openai = await createOpenAiClient();

  const completion = await openai.completions.create({
    model: 'gpt-3.5-turbo',
    prompt,
    max_tokens: 2048,
    temperature: 1
  });

  return completion.choices?.[0]?.text || '';
};
