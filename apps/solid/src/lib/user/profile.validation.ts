import * as yup from 'yup';
import { appConfig } from '../../appConfig';
import { commonField } from '../common-validation';

export const profileField = {
  displayName: () => yup.string().trim().min(1).max(30),
  timeZone: commonField.timeZone,
  locale: () => yup.string().oneOf(appConfig.languages.map((l) => l.locale))
};
