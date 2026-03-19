"use server";

import { randomInt }               from "crypto";
import { db }                      from "@/lib/db";
import { sendPasswordResetEmail }  from "@/lib/mailer";
import { rateLimit, isValidEmail } from "@/lib/rate-limit";
import bcrypt                       from "bcryptjs";
import { redirect }                 from "next/navigation";

function generateCode(): string {
  // Usa crypto.randomInt — criptograficamente seguro
  return randomInt(100000, 999999).toString();
}

const MIN_PASSWORD_LENGTH = 8;

// ── Step 1: solicitar código ──────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email)               return { error: "Informe o e-mail." };
  if (!isValidEmail(email)) return { error: "E-mail inválido." };

  // Rate limit: máx 3 solicitações por e-mail por hora
  if (!rateLimit(`reset:${email}`, 3, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde alguns minutos." };
  }

  const user = await db.user.findUnique({
    where:  { email },
    select: { name: true, email: true },
  });

  // Sempre retorna sent:true — evita enumeração de e-mails
  if (!user) return { sent: true };

  // Bloqueia se já existe token criado nos últimos 2 minutos (anti-spam)
  const recentToken = await db.passwordResetToken.findFirst({
    where: {
      email,
      used:      false,
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  });
  if (recentToken) return { sent: true }; // Silencioso — e-mail já enviado

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

  // Rate limit: máx 5 tentativas de código por e-mail por 15 min
  if (!rateLimit(`verify:${email}`, 5, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Solicite um novo código." };
  }

  const token = await db.passwordResetToken.findFirst({
    where:   { email, code, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!token)                       return { error: "Código inválido." };
  if (token.expiresAt < new Date()) return { error: "Código expirado. Solicite um novo." };

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

  if (!email || !password)                  return { error: "Dados inválidos." };
  if (password !== confirm)                  return { error: "As senhas não coincidem." };
  if (password.length < MIN_PASSWORD_LENGTH) return { error: `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.` };

  // Verifica que o e-mail existe antes de atualizar
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return { error: "Dados inválidos." };

  const hashed = await bcrypt.hash(password, 10);
  await db.user.update({ where: { id: user.id }, data: { password: hashed } });

  redirect("/?cadastro=senha-redefinida");
}
