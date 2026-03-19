"use server";

import { db }                     from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";
import bcrypt                      from "bcryptjs";
import { redirect }                from "next/navigation";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Step 1: solicitar código ───────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Informe o e-mail." };

  const user = await db.user.findUnique({ where: { email }, select: { name: true, email: true } });
  if (!user) return { error: "E-mail não encontrado." };

  // Invalida tokens anteriores
  await db.passwordResetToken.updateMany({
    where: { email, used: false },
    data:  { used: true },
  });

  const code      = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.passwordResetToken.create({
    data: { email, code, expiresAt },
  });

  try {
    await sendPasswordResetEmail(user.email, user.name, code);
  } catch (err) {
    console.error("[mailer] Erro ao enviar código:", err);
    return { error: "Erro ao enviar e-mail. Tente novamente." };
  }

  return { sent: true };
}

// ── Step 2: verificar código ──────────────────────────────────────────────────

export async function verifyResetCode(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const code  = (formData.get("code") as string)?.trim();

  if (!email || !code) return { error: "Dados inválidos." };

  const token = await db.passwordResetToken.findFirst({
    where: { email, code, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!token)                          return { error: "Código inválido." };
  if (token.expiresAt < new Date())    return { error: "Código expirado. Solicite um novo." };

  // Marca como usado
  await db.passwordResetToken.update({ where: { id: token.id }, data: { used: true } });

  redirect(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
}

// ── Step 3: redefinir senha ───────────────────────────────────────────────────

export async function resetPassword(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email    = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm  = formData.get("confirm") as string;

  if (!email || !password) return { error: "Dados inválidos." };
  if (password !== confirm) return { error: "As senhas não coincidem." };
  if (password.length < 6)  return { error: "A senha deve ter ao menos 6 caracteres." };

  const hashed = await bcrypt.hash(password, 10);
  await db.user.update({ where: { email }, data: { password: hashed } });

  redirect("/?cadastro=senha-redefinida");
}
