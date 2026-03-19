"use server";

import { redirect }                from "next/navigation";
import bcrypt                       from "bcryptjs";
import { db }                      from "@/lib/db";
import { rateLimit, isValidEmail } from "@/lib/rate-limit";

export type SignupState = {
  error?: string;
} | null;

export type SignupPayload = {
  // Empresa
  companyName: string;
  cnpj:        string;
  phone:       string;
  segment:     string;
  // Responsável
  fullName:    string;
  email:       string;
  position:    string;
  // Acesso
  password:    string;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email       = (formData.get("email")       as string).trim().toLowerCase();
  const password    = formData.get("password")    as string;
  const fullName    = (formData.get("fullName")    as string).trim();
  const companyName = (formData.get("companyName") as string).trim();
  const cnpj        = (formData.get("cnpj")        as string).replace(/\D/g, "");
  const phone       = (formData.get("phone")       as string).trim();

  // ── Validações básicas ────────────────────────────────────────────────────
  if (!isValidEmail(email))       return { error: "E-mail inválido." };
  if (password.length < 8)        return { error: "A senha deve ter ao menos 8 caracteres." };
  if (!/^\d{14}$/.test(cnpj))     return { error: "CNPJ inválido." };
  if (!fullName || !companyName)  return { error: "Preencha todos os campos obrigatórios." };

  // Rate limit: máx 3 cadastros por hora por e-mail
  if (!rateLimit(`signup:${email}`, 3, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
  }

  // ── Mock ──────────────────────────────────────────────────────────────────
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900));

    const existingEmails = [
      "admin@fretefacil.com",
      "empresa@fretefacil.com",
      "motorista@fretefacil.com",
    ];

    if (existingEmails.includes(email)) {
      return { error: "Este e-mail já está cadastrado." };
    }

    redirect("/?cadastro=sucesso");
  }

  // ── Banco real (Prisma) ───────────────────────────────────────────────────
  let existing;
  try {
    existing = await db.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[signup] DB error:", err);
    return { error: "Erro ao verificar cadastro. Tente novamente." };
  }
  if (existing) {
    return { error: "Este e-mail já está cadastrado." };
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name:     fullName,
      email,
      password: hashed,
      phone,
      role:     "COMPANY",
      status:   "PENDING",
      company: {
        create: {
          cnpj,
          tradeName: companyName,
        },
      },
    },
  });

  // Notifica todos os admins
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (admins.length > 0) {
    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title:  "Nova empresa aguardando ativação",
        body:   `${companyName} solicitou acesso à plataforma e está aguardando aprovação.`,
        type:   "COMPANY_PENDING",
        data:   JSON.stringify({ companyUserId: user.id, companyName }),
      })),
    });
  }

  redirect("/?cadastro=sucesso");
}
