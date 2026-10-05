import { expect, test, type APIRequestContext } from "@playwright/test";
import { latestMessageTo } from "../src/test/integration/mailpit";

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

async function signInWithCode(
  request: APIRequestContext,
  email: string,
  code: string,
) {
  const { csrfToken } = await (await request.get("/api/auth/csrf")).json();
  return request.post("/api/auth/callback/email-code", {
    form: { csrfToken, email, code },
    maxRedirects: 0,
  });
}

test("signs in with the code received by email (AC-07)", async ({
  request,
}) => {
  const email = uniqueEmail();

  const requested = await request.post("/api/email-code", {
    data: { email },
  });
  expect(requested.status()).toBe(200);

  await expect.poll(() => latestMessageTo(email)).not.toBeNull();
  const code = /\b(\d{6})\b/.exec((await latestMessageTo(email))!.text)![1];

  await signInWithCode(request, email, code);

  const session = await (await request.get("/api/auth/session")).json();
  expect(session?.user?.email).toBe(email);
});

test("does not sign in with a wrong code", async ({ request }) => {
  const email = uniqueEmail();
  await request.post("/api/email-code", { data: { email } });

  await signInWithCode(request, email, "000000");

  const session = await (await request.get("/api/auth/session")).json();
  expect(session?.user).toBeUndefined();
});

test("answers the same for registered and unregistered emails (AC-21)", async ({
  request,
}) => {
  const registered = uniqueEmail();
  await request.post("/api/email-code", { data: { email: registered } });
  await expect.poll(() => latestMessageTo(registered)).not.toBeNull();
  const code = /\b(\d{6})\b/.exec((await latestMessageTo(registered))!.text)![1];
  await signInWithCode(request, registered, code);

  const forRegistered = await request.post("/api/email-code", {
    data: { email: registered },
  });
  const forUnregistered = await request.post("/api/email-code", {
    data: { email: uniqueEmail() },
  });

  expect(forRegistered.status()).toBe(forUnregistered.status());
  expect(await forRegistered.text()).toBe(await forUnregistered.text());
});

test("rejects the 6th request within 15 minutes (AC-20)", async ({
  request,
}) => {
  const email = uniqueEmail();
  for (let i = 0; i < 5; i++) {
    expect((await request.post("/api/email-code", { data: { email } })).status()).toBe(200);
  }

  const sixth = await request.post("/api/email-code", { data: { email } });

  expect(sixth.status()).toBe(429);
});

test("rejects a malformed email", async ({ request }) => {
  const response = await request.post("/api/email-code", {
    data: { email: "nope" },
  });

  expect(response.status()).toBe(400);
});
