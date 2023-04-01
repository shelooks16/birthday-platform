type MailTemplate<SParam = any, HParam = any> = {
  subject: (param?: SParam) => string;
  html: (param?: HParam) => string;
};

const birthdaySoon: MailTemplate = {
  subject: () => 'Birthday starts soon',
  html: () => '<b>Birthday is very soon!!!</b>'
};

const emailVerification: MailTemplate<any, { otp: string }> = {
  subject: () => 'Verify your email',
  html: (params) => `<b>Verify pls. OTP is ${params?.otp}</b>`
};

export const mailTemplate = {
  birthdaySoon,
  emailVerification
};
