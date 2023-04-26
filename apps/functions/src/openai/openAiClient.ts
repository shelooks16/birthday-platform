import { secrets } from '../config';

export const createOpenAiClient = async () => {
  const { Configuration, OpenAIApi } = await import('openai');

  const apiKey = secrets.openai?.secretkey;

  if (!apiKey) {
    throw new Error('Open AI key is not provided');
  }

  const configuration = new Configuration({
    apiKey
  });

  return new OpenAIApi(configuration);
};
