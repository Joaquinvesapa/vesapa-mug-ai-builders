import { requestEmailCode } from "@/server/auth/email-code";
import { smtpEmailSenderFromEnv } from "@/server/email/smtp-email-sender";

// Same body for every accepted request, registered or not (RNF-12).
const ACCEPTED = { message: "If the email is valid, a code is on its way." };

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  const result = await requestEmailCode(email, {
    now: () => new Date(),
    sender: smtpEmailSenderFromEnv(),
  });

  if (result.ok) return Response.json(ACCEPTED);
  if (result.reason === "rate_limited") {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  return Response.json({ error: "Invalid email" }, { status: 400 });
}
