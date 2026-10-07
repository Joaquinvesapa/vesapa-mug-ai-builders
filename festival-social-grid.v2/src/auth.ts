import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authAdapter } from "@/server/auth/adapter";
import { signInWithPin } from "@/server/auth/pin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  // JWT is required by the Credentials provider used for username + PIN.
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "pin",
      credentials: { username: {}, pin: {} },
      async authorize({ username, pin }) {
        if (typeof username !== "string" || typeof pin !== "string") {
          return null;
        }
        const result = await signInWithPin(username, pin, { now: () => new Date() });
        return result.ok ? { id: result.user.id, name: result.user.username } : null;
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
