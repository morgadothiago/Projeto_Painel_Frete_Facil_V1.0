import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { loginRequest } from "@/services/authService";
import { db } from "@/lib/db";

const STATUS_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

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
          status:      data.user.status,
          accessToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Primeiro login: popula o token
      if (user) {
        token.id               = user.id;
        token.role             = (user as { role?: string }).role;
        token.status           = (user as { status?: string }).status;
        token.statusCheckedAt  = Date.now();
        token.accessToken      = (user as { accessToken?: string }).accessToken;

        // Buscar companyId se for COMPANY
        const role = (user as { role?: string }).role;
        if (role === "COMPANY") {
          const company = await db.company.findFirst({
            where: { userId: user.id },
            select: { id: true },
          });
          if (company) token.companyId = company.id;
        }
        return token;
      }

      // Nas chamadas seguintes: re-verifica o status no banco a cada 5 min
      const now       = Date.now();
      const lastCheck = (token.statusCheckedAt as number) ?? 0;

      if (now - lastCheck > STATUS_CHECK_INTERVAL_MS) {
        try {
          const freshUser = await db.user.findUnique({
            where:  { id: token.id as string },
            select: { status: true },
          });

          // Usuário deletado ou não encontrado → invalida sessão
          if (!freshUser) return null as never;

          token.status          = freshUser.status;
          token.statusCheckedAt = now;

          // Status mudou para não-ativo → invalida sessão imediatamente
          if (freshUser.status !== "ACTIVE") return null as never;
        } catch {
          // Erro de DB: mantém sessão para não derrubar por falha transitória
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id     = token.id as string;
      session.user.role   = token.role as string;
      session.user.status = token.status as string;
      session.accessToken = token.accessToken as string;
      if (token.companyId) {
        session.user.company = { id: token.companyId };
      }
      return session;
    },
  },
});
