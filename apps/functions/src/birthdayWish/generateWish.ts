import * as functions from 'firebase-functions';
import {
  BirthdayDocument,
  BirthdayWishDocument,
  GenerateBirthdayWishPayload,
  GenerateBirthdayWishResult
} from '@shared/types';
import { getTimestamp } from '@shared/firestore-utils';
import { documentId } from '@shared/firestore-admin-utils';
import { requireAuth } from '../utils/auth';
import { createCallableFunction } from '../utils/createFunction';
import { birthdayRepo } from '../birthday/birthday.repository';
import { createCompletion } from '../openai/completion';
import { birthdayWishRepo } from './birthdayWish.repository';
import { appConfig } from '../appConfig';
import { useI18n } from '../i18n.context';

const generateRandomWish = async (
  birthday: BirthdayDocument,
  locale?: string
): Promise<string> => {
  if (appConfig.isDevEnv) {
    const gebrish = (Math.random() + 1).toString(36).substring(7);

    return `${gebrish} - random wish from dev env. Real wish generated in live env.`;
  }

  locale = appConfig.isLanguageSupported(locale)
    ? locale
    : appConfig.defaultLocale;
  const localeLabel =
    appConfig.languages.find((l) => l.locale === locale)?.label ?? 'English';

  const desc = birthday.buddyDescription ?? '';

  const prompt = `Write birthday wish for person ${birthday.buddyName} in language ${localeLabel}. Description of person: ${desc}`;

  try {
    const completionResult = await createCompletion(prompt);

    return completionResult[0].text || '';
  } catch (err) {
    throw new functions.https.HttpsError('failed-precondition', err.message);
  }
};

export const generateBirthdayWish = createCallableFunction(
  async (data: GenerateBirthdayWishPayload, ctx) => {
    const i18n = await useI18n(data.locale);

    requireAuth(ctx, i18n);

    const birthday = await birthdayRepo()
      .findMany({
        where: [
          [documentId(), '==', data.birthdayId],
          ['profileId', '==', ctx.auth!.uid]
        ],
        limit: 1
      })
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!birthday) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        i18n.t('errors.birthday.notFound')
      );
    }

    const targetYear = new Date().getFullYear();

    const generatedWishes = await birthdayWishRepo().findMany({
      where: [
        ['year', '==', targetYear],
        ['birthdayId', '==', birthday.id]
      ],
      limit: appConfig.birthdayWishLimitPerGenerate
    });

    const limitReached =
      generatedWishes.length >= appConfig.birthdayWishLimitPerGenerate;
    const clampToLimit = data.clampToLimit ?? false;

    if (limitReached && clampToLimit) {
      const result: GenerateBirthdayWishResult = {
        wishes: generatedWishes.map((doc) => doc.wish),
        year: targetYear,
        generatedCount: generatedWishes.length,
        generateMaxCount: appConfig.birthdayWishLimitPerGenerate
      };

      return result;
    }

    if (limitReached) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        i18n.t('errors.birthdayWish.generateWish.limitReached', {
          limit: appConfig.birthdayWishLimitPerGenerate
        })
      );
    }

    const wish = await generateRandomWish(birthday, data.locale);

    const newWishDoc: BirthdayWishDocument = {
      id: birthdayWishRepo().getRandomDocId(),
      createdAt: getTimestamp(),
      birthdayId: birthday.id,
      year: targetYear,
      wish
    };

    await birthdayWishRepo().setOne(newWishDoc);

    const result: GenerateBirthdayWishResult = {
      wishes: generatedWishes.concat(newWishDoc).map((doc) => doc.wish),
      year: targetYear,
      generatedCount: generatedWishes.length + 1,
      generateMaxCount: appConfig.birthdayWishLimitPerGenerate
    };

    return result;
  }
);
