import { expect, test } from "@playwright/test";

test("Google sign-in redirects to Google's consent screen", async ({
  request,
}) => {
  const providers = await (await request.get("/api/auth/providers")).json();
  expect(providers).toHaveProperty("google");

  const { csrfToken } = await (await request.get("/api/auth/csrf")).json();
  const response = await request.post("/api/auth/signin/google", {
    form: { csrfToken, callbackUrl: "/" },
    maxRedirects: 0,
  });

  expect(response.status()).toBe(302);
  expect(response.headers().location).toMatch(
    /^https:\/\/accounts\.google\.com\//,
  );
});
