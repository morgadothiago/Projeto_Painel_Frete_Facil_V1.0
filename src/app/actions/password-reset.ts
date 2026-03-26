"use server";

import { redirect } from "next/navigation";
import { publicApi, getErrorMessage } from "@/lib/api";

// ── Step 1: solicitar código ──────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: { error?: string; sent?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) return { error: "Informe o e-mail." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-mail inválido." };

  try {
    const { data } = await publicApi.post("/api/auth/forgot-password", { email });

    // Conta inativa — API retorna 200 com error no body
    if (data?.error === "INACTIVE_ACCOUNT") {
      return { error: data.message };
    }

    return { sent: true };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
}

// ── Step 2: verificar código ──────────────────────────────────────────────────

export async function verifyResetCode(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const code = (formData.get("code") as string)?.trim();

  if (!email || !code) return { error: "Dados inválidos." };

  try {
    await publicApi.post("/api/auth/verify-reset-code", { email, code });
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  redirect(`/forgot-password/reset?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
}

// ── Step 3: redefinir senha ───────────────────────────────────────────────────

export async function resetPassword(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const code = (formData.get("code") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!email || !password) return { error: "Dados inválidos." };
  if (password !== confirm) return { error: "As senhas não coincidem." };
  if (password.length < 6) return { error: "A senha deve ter ao menos 6 caracteres." };

  try {
    await publicApi.post("/api/auth/reset-password", { email, code, newPassword: password });
  } catch (err) {
    return { error: getErrorMessage(err) };
  }

  redirect("/?cadastro=senha-redefinida");
}
