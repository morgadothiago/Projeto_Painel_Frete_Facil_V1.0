"use server";

import { db }            from "@/lib/db";
import { auth }          from "@/auth";
import { revalidatePath } from "next/cache";

export type FreightConfigData = {
  platformFeePct:   number;
  insuranceFeePct:  number;
  minimumPrice:     number;
  tollReimburse:    boolean;
  nightSurcharge:   number;
  weekendSurcharge: number;
};

export type VehicleTypePricing = {
  id:                  string;
  name:                string;
  vehicleClass:        string;
  basePrice:           number;
  pricePerKm:          number;
  helperPrice:         number;
  additionalStopPrice: number;
  isActive:            boolean;
};

async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Sem permissão");
  }
}

// Busca (ou cria) config singleton
export async function getFreightConfig(): Promise<FreightConfigData> {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return { platformFeePct: 15, insuranceFeePct: 0, minimumPrice: 0, tollReimburse: false, nightSurcharge: 0, weekendSurcharge: 0 };
  }

  let config = await db.freightConfig.findUnique({ where: { id: "singleton" } });
  if (!config) {
    config = await db.freightConfig.create({
      data: { id: "singleton", platformFeePct: 15, insuranceFeePct: 0, minimumPrice: 0, tollReimburse: false, nightSurcharge: 0, weekendSurcharge: 0 },
    });
  }
  return {
    platformFeePct:   config.platformFeePct,
    insuranceFeePct:  config.insuranceFeePct,
    minimumPrice:     config.minimumPrice,
    tollReimburse:    config.tollReimburse,
    nightSurcharge:   config.nightSurcharge,
    weekendSurcharge: config.weekendSurcharge,
  };
}

export async function saveFreightConfig(
  data: FreightConfigData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    await db.freightConfig.upsert({
      where:  { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err) {
    console.error("[saveFreightConfig]", err);
    return { ok: false, error: "Erro ao salvar configurações." };
  }
}

export async function getVehicleTypePricing(): Promise<VehicleTypePricing[]> {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") return [];

  const rows = await db.vehicleType.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id:                  r.id,
    name:                r.name,
    vehicleClass:        r.vehicleClass,
    basePrice:           Number(r.basePrice),
    pricePerKm:          Number(r.pricePerKm),
    helperPrice:         Number(r.helperPrice),
    additionalStopPrice: Number(r.additionalStopPrice),
    isActive:            r.isActive,
  }));
}

export async function saveVehicleTypePricing(
  id: string,
  pricing: Pick<VehicleTypePricing, "basePrice" | "pricePerKm" | "helperPrice" | "additionalStopPrice">,
): Promise<{ ok: boolean }> {
  try {
    await assertAdmin();
    await db.vehicleType.update({ where: { id }, data: pricing });
    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err) {
    console.error("[saveVehicleTypePricing]", err);
    return { ok: false };
  }
}
