"use server";

import { db }            from "@/lib/db";
import { auth }          from "@/auth";
import { revalidatePath } from "next/cache";

export type VehicleTypeRow = {
  id:                  string;
  name:                string;
  icon:                string;
  description:         string | null;
  vehicleClass:        string;
  size:                string;
  category:            string;
  maxWeight:           number;
  isActive:            boolean;
  basePrice:           number;
  pricePerKm:          number;
  helperPrice:         number;
  additionalStopPrice: number;
  _count: { vehicles: number; deliveries: number };
};

async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Sem permissão");
  }
}

export async function getVehicleTypes(): Promise<VehicleTypeRow[]> {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN") return [];

    const rows = await db.vehicleType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { vehicles: true, deliveries: true } } },
    });

    return rows.map((r) => ({
      ...r,
      maxWeight:           r.maxWeight,
      basePrice:           Number(r.basePrice),
      pricePerKm:          Number(r.pricePerKm),
      helperPrice:         Number(r.helperPrice),
      additionalStopPrice: Number(r.additionalStopPrice),
    }));
  } catch {
    return [];
  }
}

export type VehicleTypePayload = {
  name:                string;
  icon:                string;
  description:         string;
  vehicleClass:        string;
  size:                string;
  category:            string;
  maxWeight:           number;
  basePrice:           number;
  pricePerKm:          number;
  helperPrice:         number;
  additionalStopPrice: number;
};

function validateVehiclePayload(data: VehicleTypePayload): string | null {
  if (!data.name?.trim())              return "Nome é obrigatório.";
  if (data.maxWeight <= 0)             return "Peso máximo deve ser maior que zero.";
  if (data.basePrice < 0)              return "Preço base não pode ser negativo.";
  if (data.pricePerKm < 0)             return "Preço por km não pode ser negativo.";
  if (data.helperPrice < 0)            return "Preço do ajudante não pode ser negativo.";
  if (data.additionalStopPrice < 0)    return "Preço de parada adicional não pode ser negativo.";
  return null;
}

export async function createVehicleType(
  data: VehicleTypePayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const err = validateVehiclePayload(data);
    if (err) return { ok: false, error: err };
    await db.vehicleType.create({
      data: {
        ...data,
        description: data.description || null,
        isActive: true,
      },
    });
    revalidatePath("/dashboard/veiculos");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[createVehicleType]", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique") || msg.includes("unique"))
      return { ok: false, error: "Já existe um tipo com esse nome." };
    return { ok: false, error: msg.slice(0, 120) };
  }
}

export async function updateVehicleType(
  id: string,
  data: VehicleTypePayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const err = validateVehiclePayload(data);
    if (err) return { ok: false, error: err };
    await db.vehicleType.update({
      where: { id },
      data: { ...data, description: data.description || null },
    });
    revalidatePath("/dashboard/veiculos");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[updateVehicleType]", err);
    return { ok: false, error: "Erro ao atualizar tipo de veículo." };
  }
}

export async function toggleVehicleTypeActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean }> {
  try {
    await assertAdmin();
    await db.vehicleType.update({ where: { id }, data: { isActive } });
    revalidatePath("/dashboard/veiculos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteVehicleType(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const vt = await db.vehicleType.findUnique({
      where:   { id },
      include: { _count: { select: { vehicles: true, deliveries: true } } },
    });
    if (vt && (vt._count.vehicles > 0 || vt._count.deliveries > 0)) {
      return { ok: false, error: "Existem veículos ou entregas vinculados a este tipo." };
    }
    await db.vehicleType.delete({ where: { id } });
    revalidatePath("/dashboard/veiculos");
    return { ok: true };
  } catch {
    return { ok: false, error: "Erro ao excluir tipo de veículo." };
  }
}
