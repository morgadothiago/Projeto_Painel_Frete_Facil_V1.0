"use server";

import { redirect } from "next/navigation";

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
  const email = formData.get("email") as string;

  // ── Mock: simula latência e verifica se e-mail já existe ──────────────────
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

    // Sucesso → redireciona para login com flag de cadastro realizado
    redirect("/?cadastro=sucesso");
  }

  // ── Banco real (Prisma) ───────────────────────────────────────────────────
  // TODO: implementar com Prisma quando backend estiver pronto
  redirect("/?cadastro=sucesso");
}
