import type { NextAuthConfig } from "next-auth";

const isDev = process.env.NODE_ENV !== "production";

// Config edge-compatible (sem Node.js APIs) — usada pelo proxy.ts
// O CredentialsProvider fica apenas no auth.ts completo
export const authConfig: NextAuthConfig = {
  // Em dev: sempre confia no host (localhost)
  // Em produção: NEXTAUTH_URL deve ser definido
  trustHost: isDev || !process.env.NEXTAUTH_URL,
  pages: {
    signIn: "/",
    error:  "/",
  },
  providers: [], // providers reais ficam no auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn    = !!auth?.user;
      const isLoginPage   = nextUrl.pathname === "/";
      const isDashboard   = nextUrl.pathname.startsWith("/dashboard");
      const isAdminRoute  = nextUrl.pathname.startsWith("/dashboard/admin");

      // Logado tentando acessar login → dashboard
      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Rota protegida sem sessão → login
      if (isDashboard && !isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Admin route sem role ADMIN → dashboard
      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
