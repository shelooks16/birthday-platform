import * as yup from 'yup';

export const commonField = {
  timeZone: () => yup.string().trim().min(1).max(30)
};
