export interface SendEmailData {
  /** Recipient email */
  to: string;
  /** Email subject */
  subject: string;
  /** Markup for the email */
  html: string;
}
