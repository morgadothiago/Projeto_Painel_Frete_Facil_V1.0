import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { loginRequest } from "@/services/authService";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",  type: "email" },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const data = await loginRequest(
          credentials.email as string,
          credentials.password as string,
        );

        if (!data) return null;

        return {
          id:          data.user.id,
          name:        data.user.name,
          email:       data.user.email,
          role:        data.user.role,
          accessToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.role        = (user as { role?: string }).role;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id     = token.id as string;
      session.user.role   = token.role as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
