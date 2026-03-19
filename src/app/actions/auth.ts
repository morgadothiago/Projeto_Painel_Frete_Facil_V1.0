"use server";

import { signIn, signOut } from "@/auth";
import { AuthError }       from "next-auth";
import { db }              from "@/lib/db";

export type LoginState = {
  error?: string;
  code?:  "BLOCKED" | "PENDING" | "INVALID";
} | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  // Verifica status antes de tentar autenticar — para mensagem de erro correta
  if (email) {
    const found = await db.user.findUnique({
      where:  { email },
      select: { status: true },
    });
    if (found?.status === "INACTIVE") return { error: "BLOCKED", code: "BLOCKED" };
    if (found?.status === "PENDING")  return { error: "PENDING", code: "PENDING" };
  }

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
