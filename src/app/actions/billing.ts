"use server";

import { auth } from "@/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export type CompanyAccessCheck = {
  allowed: boolean;
  reason?: "INACTIVE" | "PENDING" | "OVERDUE";
};

export async function checkCompanyAccess(): Promise<CompanyAccessCheck> {
  const session = await auth();
  if (!session) return { allowed: false };

  const token = (session as any).accessToken;
  const companyId = (session.user as any).company?.id;

  console.log("[checkCompanyAccess] companyId:", companyId, "role:", session.user.role);

  if (!companyId) return { allowed: true };

  try {
    // 1. Busca dados da empresa na API
    const companyRes = await fetch(`${API_BASE_URL}/api/companies/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("[checkCompanyAccess] /companies/me status:", companyRes.status);

    if (!companyRes.ok) return { allowed: true };

    const company = await companyRes.json();
    const userStatus = company.user?.status;

    console.log("[checkCompanyAccess] userStatus:", userStatus);

    // 2. Verifica se empresa está ativa
    if (userStatus === "INACTIVE") return { allowed: false, reason: "INACTIVE" };
    if (userStatus === "PENDING") return { allowed: false, reason: "PENDING" };

    // 3. Verifica pagamento atrasado
    const paymentRes = await fetch(
      `${API_BASE_URL}/api/payments/company/${companyId}/check`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("[checkCompanyAccess] payment check status:", paymentRes.status);

    if (paymentRes.ok) {
      const data = await paymentRes.json();
      console.log("[checkCompanyAccess] payment data:", data);
      if (data.active === false) {
        return { allowed: false, reason: "OVERDUE" };
      }
    }

    return { allowed: true };
  } catch (err) {
    console.log("[checkCompanyAccess] error:", err);
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

  const token = (session as any).accessToken;
  const companyId = (session.user as any).company?.id;
  if (!companyId) return null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/payments/company/${companyId}/pending`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
