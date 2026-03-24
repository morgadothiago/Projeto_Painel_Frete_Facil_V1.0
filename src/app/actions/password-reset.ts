"use server";

import { redirect } from "next/navigation";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// ── Step 1: solicitar código ──────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: { error?: string; sent?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) return { error: "Informe o e-mail." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-mail inválido." };

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);

    // Conta inativa — API retorna 200 com error no body
    if (data?.error === "INACTIVE_ACCOUNT") {
      return { error: data.message };
    }

    if (!res.ok) {
      return { error: data?.message ?? "Erro ao enviar código. Tente novamente." };
    }
  } catch {
    return { error: "Erro ao conectar com o servidor." };
  }

  return { sent: true };
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
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message ?? "Código inválido ou expirado." };
    }
  } catch {
    return { error: "Erro ao conectar com o servidor." };
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
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword: password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message ?? "Erro ao redefinir senha." };
    }
  } catch {
    return { error: "Erro ao conectar com o servidor." };
  }

  redirect("/?cadastro=senha-redefinida");
}
