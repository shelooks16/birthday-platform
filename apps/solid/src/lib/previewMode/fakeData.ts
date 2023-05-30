import { getTimestamp } from '@shared/firestore-utils';
import {
  BirthdayDocument,
  ChannelType,
  NotificationChannelDocument,
  NotificationDocument,
  ProfileDocument
} from '@shared/types';
import type { User } from 'firebase/auth';
import { appConfig } from '../../appConfig';
import { resolveCurrentI18nInstance } from '../../i18n.context';

const user = (): User =>
  ({
    uid: 'preview-mode'
  } as User);

const profile = (
  locale: string = appConfig.defaultLocale,
  timeZone = 'Europe/London'
): ProfileDocument => ({
  id: 'preview-mode',
  botPairingCode: 'preview-mode',
  createdAt: getTimestamp(),
  displayName:
    resolveCurrentI18nInstance()?.t?.('previewMode.previewTitle') ||
    'You are looking at demo',
  locale,
  timeZone
});

const birthdays = (): BirthdayDocument[] => {
  const now = new Date();

  return [
    {
      id: '1',
      profileId: 'preview-mode',
      birth: {
        day: 22,
        month: now.getMonth(),
        year: now.getFullYear() - 18
      },
      buddyName: 'John Doe',
      createdAt: getTimestamp(),
      notificationSettings: null,
      buddyDescription: 'Average human being'
    },
    {
      id: '2',
      profileId: 'preview-mode',
      birth: {
        day: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear() - 28
      },
      buddyName: 'Alexander',
      createdAt: getTimestamp(),
      notificationSettings: null,
      buddyDescription: 'My bestie from school, loves chocolate cakes'
    },
    {
      id: '3',
      profileId: 'preview-mode',
      birth: {
        day: 22,
        month: now.getMonth(),
        year: now.getFullYear() - 18
      },
      buddyName: 'Elin',
      createdAt: getTimestamp(),
      notificationSettings: null,
      buddyDescription: 'Enjoys playing Tera'
    },
    {
      id: '4',
      profileId: 'preview-mode',
      birth: {
        day: 22,
        month: now.getMonth(),
        year: now.getFullYear() - 20
      },
      buddyName: 'Sara',
      createdAt: getTimestamp(),
      notificationSettings: null
    },
    {
      id: '5',
      profileId: 'preview-mode',
      birth: {
        day: 10,
        month: now.getMonth(),
        year: now.getFullYear() - 23
      },
      buddyName: 'PkGod',
      createdAt: getTimestamp(),
      notificationSettings: null
    },
    {
      id: '6',
      profileId: 'preview-mode',
      birth: {
        day: 20,
        month: now.getMonth(),
        year: now.getFullYear() - 28
      },
      buddyName: 'Mr. Bivi',
      createdAt: getTimestamp(),
      notificationSettings: null,
      buddyDescription: 'Description of a wise man'
    },
    {
      id: '7',
      profileId: 'preview-mode',
      birth: {
        day: 28,
        month: now.getMonth(),
        year: now.getFullYear() - 33
      },
      buddyName: 'Andrew',
      createdAt: getTimestamp(),
      notificationSettings: null
    },
    {
      id: '8',
      profileId: 'preview-mode',
      birth: {
        day: 24,
        month: now.getMonth() + 1,
        year: now.getFullYear() - 14
      },
      buddyName: 'Vertigo',
      createdAt: getTimestamp(),
      notificationSettings: {
        notifyAtBefore: ['1d'],
        notifyChannelsIds: ['gbsaxa', 'xgdhda'],
        timeZone: 'Europe/Kiev'
      }
    },
    {
      id: '9',
      profileId: 'preview-mode',
      birth: {
        day: 10,
        month: now.getMonth() - 1,
        year: now.getFullYear() - 5
      },
      buddyName: 'Varmilion',
      createdAt: getTimestamp(),
      notificationSettings: null
    },
    {
      id: '10',
      profileId: 'preview-mode',
      birth: {
        day: 10,
        month: now.getMonth() + 2,
        year: now.getFullYear() - 22
      },
      buddyName: 'Max',
      createdAt: getTimestamp(),
      notificationSettings: {
        notifyAtBefore: ['1h', '3d'],
        notifyChannelsIds: ['xgdhda'],
        timeZone: 'Europe/London'
      }
    }
  ];
};

const notificationChannels = (): NotificationChannelDocument[] => [
  {
    id: 'efaexa',
    profileId: 'preview-mode',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
    type: ChannelType.email,
    displayName: 'demo@demo.com',
    value: 'demo@demo.com'
  },
  {
    id: 'xgdhda',
    profileId: 'preview-mode',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
    type: ChannelType.email,
    displayName: 'gmail@yahoo.com',
    value: 'gmail@yahoo.com'
  },
  {
    id: 'gbsaxa',
    profileId: 'preview-mode',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
    type: ChannelType.telegram,
    displayName: 'perfectWetGuy',
    value: 'perfectWetGuy'
  }
];

const notifications = (): NotificationDocument[] => [
  {
    id: 'safhd12fd',
    createdAt: getTimestamp(),
    isScheduled: false,
    isSent: false,
    notificationChannelId: 'xgdhda',
    profileId: 'preview-mode',
    sourceBirthdayId: '10',
    notifyAt: getTimestamp(new Date(new Date().getTime() + 1000 * 6e2))
  },
  {
    id: 'vbnaxzc',
    createdAt: getTimestamp(),
    isScheduled: false,
    isSent: false,
    notificationChannelId: 'gbsaxa',
    profileId: 'preview-mode',
    sourceBirthdayId: '8',
    notifyAt: getTimestamp(new Date(new Date().getTime() + 1000 * 6e5))
  }
];

export const previewData = {
  user,
  profile,
  birthdays,
  notificationChannels,
  notifications
};
