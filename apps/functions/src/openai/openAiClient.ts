import { MemoryCache } from '@shared/memory-cache';
import { appConfig } from '../appConfig';

const openAiClient = async () => {
  const apiKey = appConfig.secrets.openai.secretkey.value();

  if (!apiKey) {
    throw new Error('Open AI is disabled. Reason: missing secret key');
  }

  const { default: OpenAi } = await import('openai');

  return new OpenAi({
    apiKey
  });
};

export const createOpenAiClient = async () =>
  MemoryCache.getOrSet('openai', openAiClient);
