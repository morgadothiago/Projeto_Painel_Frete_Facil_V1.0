"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  error?: string;
} | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email:      formData.get("email"),
      password:   formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // signIn lança um redirect interno — precisamos re-lançar para funcionar
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha invalidos." };
        default:
          return { error: "Erro ao entrar. Tente novamente." };
      }
    }
    throw error; // re-lança o redirect do NextAuth
  }
  return null;
}
