import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from '../appConfig';

const openAiClient = async () => {
  const { Configuration, OpenAIApi } = await import('openai');

  const apiKey = appConfig.secrets.openai.secretkey.value();

  if (!apiKey) {
    throw new Error('Open AI key is not provided');
  }

  const configuration = new Configuration({
    apiKey
  });

  return new OpenAIApi(configuration);
};

export const createOpenAiClient = async () =>
  MemoryCache.getOrSet('openai', openAiClient);
