"use server";

import { redirect } from "next/navigation";
import { rateLimit, isValidEmail } from "@/lib/rate-limit";
import { publicApi, getErrorMessage } from "@/lib/api";
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export type SignupState = {
  error?: string;
} | null;

export type SignupPayload = {
  companyName: string;
  cnpj: string;
  phone: string;
  fullName: string;
  email: string;
  password: string;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email       = (formData.get("email")       as string).trim().toLowerCase();
  const password    = formData.get("password")    as string;
  const fullName    = (formData.get("fullName")    as string).trim();
  const companyName = (formData.get("companyName") as string).trim();
  const cnpjRaw     = (formData.get("cnpj")        as string).replace(/\D/g, "");
  const phone       = (formData.get("phone")       as string).trim();

  // ── Validações básicas ────────────────────────────────────────────────────
  if (!isValidEmail(email))       return { error: "E-mail inválido." };
  if (password.length < 6)        return { error: "A senha deve ter ao menos 6 caracteres." };
  if (!/^\d{14}$/.test(cnpjRaw))  return { error: "CNPJ inválido." };
  if (!fullName || !companyName)  return { error: "Preencha todos os campos obrigatórios." };

  // Rate limit: máx 3 cadastros por hora por e-mail
  if (!rateLimit(`signup:${email}`, 3, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
  }

  // Formata CNPJ para o padrão da API (00.000.000/0000-00)
  const cnpj = cnpjRaw.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );

  // ── Cria empresa via API ──────────────────────────────────────────────────
  try {
    // 1. Login como admin para obter token
    const { data: loginData } = await publicApi.post("/api/auth/login", {
      email: process.env.ADMIN_API_EMAIL || "admin@fretefacil.com",
      password: process.env.ADMIN_API_PASSWORD || "admin123",
    });

    const { access_token } = loginData;

    // 2. Cria empresa via API
    const authApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    await authApi.post("/api/companies", {
      name: fullName,
      email,
      password,
      phone: phone || undefined,
      tradeName: companyName,
      cnpj,
    });
  } catch (err) {
    const message = getErrorMessage(err);

    if (message.includes("E-mail já cadastrado")) return { error: "Este e-mail já está cadastrado." };
    if (message.includes("CNPJ já cadastrado")) return { error: "Este CNPJ já está cadastrado." };

    return { error: message };
  }

  redirect("/?cadastro=sucesso");
}
