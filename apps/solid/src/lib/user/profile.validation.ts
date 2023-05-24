import * as yup from 'yup';
import { appConfig } from '../../appConfig';
import { commonField } from '../common-validation';

export const profileField = {
  timeZone: commonField.timeZone,
  locale: () => yup.string().oneOf(appConfig.languages.map((l) => l.locale))
};
