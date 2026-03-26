"use server";

import { auth } from "@/auth";
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

function createAuthApi(token: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export type CompanyAccessCheck = {
  allowed: boolean;
  reason?: "INACTIVE" | "PENDING" | "OVERDUE";
};

export async function checkCompanyAccess(): Promise<CompanyAccessCheck> {
  const session = await auth();
  if (!session) return { allowed: false };

  const api = createAuthApi((session as any).accessToken);
  const companyId = (session.user as any).company?.id;

  if (!companyId) return { allowed: true };

  try {
    // 1. Busca dados da empresa na API
    const { data: company } = await api.get("/api/companies/me");
    const userStatus = company.user?.status;

    // 2. Verifica se empresa está ativa
    if (userStatus === "INACTIVE") return { allowed: false, reason: "INACTIVE" };
    if (userStatus === "PENDING") return { allowed: false, reason: "PENDING" };

    // 3. Verifica pagamento atrasado
    const { data: paymentCheck } = await api.get(`/api/payments/company/${companyId}/check`);

    if (paymentCheck.active === false) {
      return { allowed: false, reason: "OVERDUE" };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export type PendingPayment = {
  id: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  description: string | null;
};

export async function getPendingPayment(): Promise<PendingPayment | null> {
  const session = await auth();
  if (!session) return null;

  const api = createAuthApi((session as any).accessToken);
  const companyId = (session.user as any).company?.id;
  if (!companyId) return null;

  try {
    const { data } = await api.get(`/api/payments/company/${companyId}/pending`);
    return data;
  } catch {
    return null;
  }
}
