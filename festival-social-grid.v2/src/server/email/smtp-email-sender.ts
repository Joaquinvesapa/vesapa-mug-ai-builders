import nodemailer from "nodemailer";
import type { EmailSender } from "./email-sender";

export type SmtpConfig = {
  host: string;
  port: number;
  from: string;
};

export function createSmtpEmailSender(config: SmtpConfig): EmailSender {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
  });

  return {
    async send(message) {
      await transport.sendMail({ from: config.from, ...message });
    },
  };
}

export function smtpEmailSenderFromEnv(): EmailSender {
  const { SMTP_HOST, SMTP_PORT, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !EMAIL_FROM) {
    throw new Error("SMTP_HOST, SMTP_PORT and EMAIL_FROM must be set");
  }
  return createSmtpEmailSender({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    from: EMAIL_FROM,
  });
}
