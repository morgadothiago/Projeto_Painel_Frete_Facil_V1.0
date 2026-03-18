import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

// Lê o token JWT diretamente do cookie — sem chamar auth() internamente,
// evitando o loop de redirect em /api/auth/session
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas do NextAuth e assets nunca precisam de verificação
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await decode({
    token:  req.cookies.get(cookieName)?.value,
    secret: process.env.AUTH_SECRET!,
    salt:   cookieName,
  });

  const isLoggedIn  = !!token;
  const isLoginPage = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin     = pathname.startsWith("/dashboard/admin");

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdmin && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
