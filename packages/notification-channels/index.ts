const emailPrefix = 'email:';

export const createEmailChannel = (email: string) => `${emailPrefix}:${email}`;
export const isEmailChannel = (value: string) => value.startsWith(emailPrefix);
export const getEmailFromEmailChannel = (value: string) =>
  value.replace(emailPrefix, '');
