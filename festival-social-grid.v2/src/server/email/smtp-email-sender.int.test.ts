import { beforeEach, describe, expect, it } from "vitest";
import { createSmtpEmailSender } from "@/server/email/smtp-email-sender";
import { clearMailbox, latestMessageTo } from "@/test/integration/mailpit";

describe("SMTP email sender", () => {
  beforeEach(clearMailbox);

  it("delivers a message through SMTP", async () => {
    const sender = createSmtpEmailSender({
      host: "localhost",
      port: 1025,
      from: "Festival <no-reply@festival.test>",
    });

    await sender.send({
      to: "ana@example.com",
      subject: "Hola",
      text: "Cuerpo del mensaje",
    });

    const message = await latestMessageTo("ana@example.com");
    expect(message?.subject).toBe("Hola");
    expect(message?.text).toContain("Cuerpo del mensaje");
  });
});
