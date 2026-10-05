const MAILPIT_API = process.env.MAILPIT_API_URL ?? "http://localhost:8025/api/v1";

type MailpitSummary = { ID: string; To: { Address: string }[]; Subject: string };

export async function clearMailbox(): Promise<void> {
  await fetch(`${MAILPIT_API}/messages`, { method: "DELETE" });
}

/** Returns the plain-text body of the latest message sent to `to`. */
export async function latestMessageTo(
  to: string,
): Promise<{ subject: string; text: string } | null> {
  const res = await fetch(`${MAILPIT_API}/messages`);
  const { messages } = (await res.json()) as { messages: MailpitSummary[] };
  const summary = messages.find((m) => m.To.some((r) => r.Address === to));
  if (!summary) return null;

  const detail = await (await fetch(`${MAILPIT_API}/message/${summary.ID}`)).json();
  return { subject: summary.Subject, text: detail.Text as string };
}
