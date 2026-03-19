"use server";

import { db }          from "@/lib/db";
import { auth }        from "@/auth";
import { revalidatePath } from "next/cache";

export type CompanyRow = {
  id:        string;
  userId:    string;
  cnpj:      string;
  tradeName: string | null;
  status:    string;
  name:      string;
  email:     string;
  phone:     string | null;
  createdAt: Date;
};

export async function getCompanies(): Promise<CompanyRow[]> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  const companies = await db.company.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  });

  return companies.map((c) => ({
    id:        c.id,
    userId:    c.userId,
    cnpj:      c.cnpj,
    tradeName: c.tradeName,
    status:    c.user.status,
    name:      c.user.name,
    email:     c.user.email,
    phone:     c.user.phone,
    createdAt: c.user.createdAt,
  }));
}

export async function updateCompanyStatus(
  userId: string,
  status: "ACTIVE" | "PENDING" | "INACTIVE",
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" };
  }

  await db.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/dashboard/empresas");
  return { ok: true };
}
