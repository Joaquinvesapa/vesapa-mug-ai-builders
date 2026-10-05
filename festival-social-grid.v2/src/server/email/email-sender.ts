export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

/** Outgoing email port; the real provider is plugged in at deploy time. */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}
