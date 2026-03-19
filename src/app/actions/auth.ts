"use server";

import { signIn, signOut }         from "@/auth";
import { AuthError }               from "next-auth";
import { db }                      from "@/lib/db";
import { rateLimit, isValidEmail } from "@/lib/rate-limit";

export type LoginState = {
  error?: string;
  code?:  "BLOCKED" | "PENDING" | "INVALID" | "RATE_LIMIT";
} | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return { error: "E-mail inválido.", code: "INVALID" };
  }

  // Rate limit: máx 5 tentativas de login por e-mail por hora
  if (!rateLimit(`login:${email}`, 5, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde antes de tentar novamente.", code: "RATE_LIMIT" };
  }

  // Verifica status antes de tentar autenticar — para mensagem de erro correta
  const found = await db.user.findUnique({
    where:  { email },
    select: { status: true },
  });
  if (found?.status === "INACTIVE") return { error: "BLOCKED", code: "BLOCKED" };
  if (found?.status === "PENDING")  return { error: "PENDING", code: "PENDING" };

  try {
    await signIn("credentials", {
      email,
      password:   formData.get("password"),
      redirectTo: "/loading-screen",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha inválidos.", code: "INVALID" };
        default:
          return { error: "Erro ao entrar. Tente novamente." };
      }
    }
    throw error;
  }
  return null;
}

export async function signoutAction() {
  await signOut({ redirectTo: "/" });
}
