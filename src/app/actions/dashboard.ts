"use server";

import { db }   from "@/lib/db";
import { auth } from "@/auth";

type MonthlyPoint = { mes: string; novas: number; total: number };
type StatusPoint  = { label: string; qtd: number };

export type DashboardStats = {
  empresas: {
    monthly: MonthlyPoint[];
    status:  StatusPoint[];
    stat:    { value: string; label: string; new: string };
  };
  usuarios: {
    monthly: MonthlyPoint[];
    status:  StatusPoint[];
    stat:    { value: string; label: string; new: string };
  };
  faturamento: {
    monthly: MonthlyPoint[];
    status:  StatusPoint[];
    stat:    { value: string; label: string; new: string };
  };
};

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function getLast6Months() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      year:  d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
      key:   `${d.getFullYear()}-${d.getMonth()}`,
    };
  });
}

function buildMonthlyCount(
  dates:  Date[],
  months: ReturnType<typeof getLast6Months>,
): MonthlyPoint[] {
  const windowStart = new Date(months[0].year, months[0].month, 1);
  const counts: Record<string, number> = {};
  months.forEach(m => (counts[m.key] = 0));

  let totalBefore = 0;
  for (const date of dates) {
    if (date < windowStart) {
      totalBefore++;
    } else {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (key in counts) counts[key]++;
    }
  }

  let running = totalBefore;
  return months.map(m => {
    const novas = counts[m.key] ?? 0;
    running += novas;
    return { mes: m.label, novas, total: running };
  });
}

function buildMonthlyAmount(
  entries: { date: Date; amount: number }[],
  months:  ReturnType<typeof getLast6Months>,
): MonthlyPoint[] {
  const windowStart = new Date(months[0].year, months[0].month, 1);
  const sums: Record<string, number> = {};
  months.forEach(m => (sums[m.key] = 0));

  let totalBefore = 0;
  for (const entry of entries) {
    if (entry.date < windowStart) {
      totalBefore += entry.amount;
    } else {
      const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
      if (key in sums) sums[key] += entry.amount;
    }
  }

  let running = totalBefore;
  return months.map(m => {
    const novas = Math.round(sums[m.key] ?? 0);
    running += novas;
    return { mes: m.label, novas, total: Math.round(running) };
  });
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(1)}k`;
  return `R$ ${value.toFixed(0)}`;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const months = getLast6Months();
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Companies ──────────────────────────────────────────────────
  const companies = await db.company.findMany({
    include: { user: { select: { status: true, createdAt: true } } },
  });

  const companyDates   = companies.map(c => c.user.createdAt);
  const companyMonthly = buildMonthlyCount(companyDates, months);
  const totalCompanies = companies.length;
  const newThisMonth   = companyDates.filter(d => d >= currentMonthStart).length;

  const companyByStatus: StatusPoint[] = [
    { label: "Ativas",    qtd: companies.filter(c => c.user.status === "ACTIVE").length },
    { label: "Pendentes", qtd: companies.filter(c => c.user.status === "PENDING").length },
    { label: "Inativas",  qtd: companies.filter(c => c.user.status === "INACTIVE").length },
  ];

  // ── Users ──────────────────────────────────────────────────────
  const users = await db.user.findMany({
    select: { role: true, createdAt: true },
  });

  const userDates      = users.map(u => u.createdAt);
  const userMonthly    = buildMonthlyCount(userDates, months);
  const totalUsers     = users.length;
  const newUsersMonth  = userDates.filter(d => d >= currentMonthStart).length;

  const userByRole: StatusPoint[] = [
    { label: "Admin",     qtd: users.filter(u => u.role === "ADMIN").length },
    { label: "Empresa",   qtd: users.filter(u => u.role === "COMPANY").length },
    { label: "Motorista", qtd: users.filter(u => u.role === "DRIVER").length },
  ];

  // ── Billing ────────────────────────────────────────────────────
  const billings = await db.billing.findMany({
    select: { status: true, netAmount: true, createdAt: true },
  });

  const billingEntries  = billings.map(b => ({ date: b.createdAt, amount: b.netAmount.toNumber() }));
  const billingMonthly  = buildMonthlyAmount(billingEntries, months);
  const totalBilling    = billings
    .filter(b => b.status === "COMPLETED")
    .reduce((s, b) => s + b.netAmount.toNumber(), 0);
  const thisMonthBilling = billingEntries
    .filter(e => e.date >= currentMonthStart)
    .reduce((s, e) => s + e.amount, 0);

  const billingByStatus: StatusPoint[] = [
    { label: "Pago",      qtd: Math.round(billings.filter(b => b.status === "COMPLETED").reduce((s, b) => s + b.netAmount.toNumber(), 0)) },
    { label: "Pendente",  qtd: Math.round(billings.filter(b => b.status === "PENDING").reduce((s, b) => s + b.netAmount.toNumber(), 0)) },
    { label: "Cancelado", qtd: Math.round(billings.filter(b => b.status === "REJECTED").reduce((s, b) => s + b.netAmount.toNumber(), 0)) },
  ];

  return {
    empresas: {
      monthly: companyMonthly,
      status:  companyByStatus,
      stat: {
        value: String(totalCompanies),
        label: "empresas cadastradas",
        new:   newThisMonth > 0 ? `+${newThisMonth} este mês` : "nenhuma este mês",
      },
    },
    usuarios: {
      monthly: userMonthly,
      status:  userByRole,
      stat: {
        value: String(totalUsers),
        label: "usuários cadastrados",
        new:   newUsersMonth > 0 ? `+${newUsersMonth} este mês` : "nenhum este mês",
      },
    },
    faturamento: {
      monthly: billingMonthly,
      status:  billingByStatus,
      stat: {
        value: formatCurrency(totalBilling),
        label: "faturamento total",
        new:   thisMonthBilling > 0 ? `+${formatCurrency(thisMonthBilling)} este mês` : "R$ 0 este mês",
      },
    },
  };
}
