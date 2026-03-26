"use server";

import { auth } from "@/auth";
import { api }  from "@/lib/api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "PENDENTE" | "PAGO" | "ATRASADO";

export type Payment = {
  id:          string;
  amount:      number;
  dueDate:     string;
  paidAt:      string | null;
  status:      PaymentStatus;
  description: string | null;
  createdAt:   string;
};

export type PaymentStats = {
  total:   number;
  paid:    number;
  pending: number;
  overdue: number;
  count:   number;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getCompanyId(): Promise<string | null> {
  const session = await auth();
  if (!session) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session.user as any).company?.id ?? null;
}

// ─── Listar pagamentos da empresa ─────────────────────────────────────────────

export async function getCompanyPayments(): Promise<Payment[]> {
  const companyId = await getCompanyId();
  if (!companyId) return [];

  try {
    const { data } = await api.get(`/api/payments/company/${companyId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((p) => ({
      id:          p.id,
      amount:      Number(p.amount),
      dueDate:     p.dueDate,
      paidAt:      p.paidAt ?? null,
      status:      p.status as PaymentStatus,
      description: p.description ?? null,
      createdAt:   p.createdAt,
    }));
  } catch (err) {
    console.error("[getCompanyPayments]", err);
    return [];
  }
}

// ─── Stats financeiros da empresa ─────────────────────────────────────────────

export async function getCompanyPaymentStats(): Promise<PaymentStats> {
  const zero: PaymentStats = { total: 0, paid: 0, pending: 0, overdue: 0, count: 0 };
  const companyId = await getCompanyId();
  if (!companyId) return zero;

  try {
    const { data } = await api.get(`/api/payments/company/${companyId}/stats`);
    return {
      total:   Number(data.total   ?? 0),
      paid:    Number(data.paid    ?? 0),
      pending: Number(data.pending ?? 0),
      overdue: Number(data.overdue ?? 0),
      count:   Number(data.count   ?? 0),
    };
  } catch {
    return zero;
  }
}
