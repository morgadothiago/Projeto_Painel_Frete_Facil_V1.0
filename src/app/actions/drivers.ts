"use server";

import { auth } from "@/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export type DriverRow = {
  id:              string;
  userId:          string;
  cpf:             string;
  name:            string;
  email:           string;
  phone:           string | null;
  isOnline:        boolean;
  rating:          number;
  totalDeliveries: number;
  status:          string;
  autonomo:        boolean;
  createdAt:       Date;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDriver(raw: any): DriverRow {
  return {
    id:              raw.id,
    userId:          raw.userId ?? raw.user?.id ?? "",
    cpf:             raw.cpf ?? "",
    name:            raw.user?.name ?? raw.name ?? "—",
    email:           raw.user?.email ?? raw.email ?? "",
    phone:           raw.user?.phone ?? raw.phone ?? null,
    isOnline:        raw.isOnline ?? false,
    rating:          Number(raw.rating ?? 0),
    totalDeliveries: raw.totalDeliveries ?? 0,
    status:          raw.user?.status ?? raw.status ?? "ACTIVE",
    autonomo:        raw.autonomo ?? true,
    createdAt:       new Date(raw.user?.createdAt ?? raw.createdAt ?? Date.now()),
  };
}

export async function getCompanies() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão");
  }

  try {
    const { data } = await api.get("/api/companies?limit=100");
    return (data.data ?? []).map((c: { id: string; tradeName?: string; user?: { name?: string } }) => ({
      id: c.id,
      name: c.tradeName || c.user?.name || "Empresa sem nome",
    }));
  } catch {
    return [];
  }
}

export async function getDrivers(_companyId: string): Promise<DriverRow[]> {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  try {
    const { data } = await api.get("/api/drivers?limit=100");
    const all: DriverRow[] = (data.data ?? []).map(mapDriver);
    return all.filter(d => d.autonomo === false);
  } catch {
    return [];
  }
}

export async function getAllDrivers(): Promise<DriverRow[]> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão");
  }

  try {
    const { data } = await api.get("/api/drivers?limit=100");
    return (data.data ?? []).map(mapDriver);
  } catch {
    return [];
  }
}

export async function createDriver(data: {
  name:     string;
  email:    string;
  cpf:      string;
  phone?:   string;
  password: string;
}) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "Não autenticado" };
  }

  if (session.user.role !== "COMPANY") {
    return { ok: false, error: "Apenas empresas podem cadastrar motoristas" };
  }

  try {
    await api.post("/api/drivers", {
      name:      data.name,
      email:     data.email,
      cpf:       data.cpf.replace(/\D/g, ""),
      phone:     data.phone,
      password:  data.password,
      autonomo:  false,
    });

    revalidatePath("/dashboard/motoristas");
    return { ok: true };
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao criar motorista";
    return { ok: false, error: msg };
  }
}

export async function updateDriverStatus(userId: string, status: string) {
  const session = await auth();
  if (!session?.user?.company?.id) {
    return { ok: false, error: "Empresa não encontrada" };
  }

  try {
    await api.patch(`/api/drivers/${userId}/status`, { status });
    revalidatePath("/dashboard/motoristas");
    return { ok: true };
  } catch {
    return { ok: false, error: "Erro ao atualizar status" };
  }
}

export async function deleteDriver(userId: string) {
  const session = await auth();
  if (!session?.user?.company?.id) {
    return { ok: false, error: "Empresa não encontrada" };
  }

  try {
    await api.delete(`/api/drivers/${userId}`);
    revalidatePath("/dashboard/motoristas");
    return { ok: true };
  } catch {
    return { ok: false, error: "Erro ao remover motorista" };
  }
}
