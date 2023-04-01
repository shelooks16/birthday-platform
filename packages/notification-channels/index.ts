const emailPrefix = 'email:';

export const extractChannelType = (value: string) => value.split(':')[0];

export const createEmailChannel = (email: string) => `${emailPrefix}${email}`;
export const isEmailChannel = (value: string) => value.startsWith(emailPrefix);
export const getEmailFromEmailChannel = (value: string) =>
  value.replace(emailPrefix, '');
