import { NotifyBeforePreset } from '@shared/types';
import { commonField } from '../common-validation';
import * as yup from 'yup';

export const birthdayField = {
  buddyName: () => yup.string().trim().min(1).max(30),
  buddyDescription: () => yup.string().max(100),
  birth: {
    day: () => yup.number().min(1).max(31),
    month: () => yup.number().min(0).max(11),
    year: () => yup.number().min(1950).max(new Date().getFullYear())
  },
  notificationSettings: {
    notifyAtBefore: () =>
      yup.array(yup.string<NotifyBeforePreset>().required()).min(1),
    notifyChannelsIds: () => yup.array(yup.string().required()).min(1),
    timeZone: commonField.timeZone
  }
};
