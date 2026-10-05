import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authAdapter } from "@/server/auth/adapter";
import { verifyEmailCode } from "@/server/auth/email-code";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  // JWT is required by the Credentials provider used for email codes.
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "email-code",
      credentials: { email: {}, code: {} },
      authorize({ email, code }) {
        if (typeof email !== "string" || typeof code !== "string") {
          return null;
        }
        return verifyEmailCode(email, code, { now: () => new Date() });
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
