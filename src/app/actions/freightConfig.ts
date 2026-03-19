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

function validateFreightConfig(data: FreightConfigData): string | null {
  if (data.platformFeePct  < 0 || data.platformFeePct  > 100) return "Comissão da plataforma deve ser entre 0% e 100%.";
  if (data.insuranceFeePct < 0 || data.insuranceFeePct > 100) return "Taxa de seguro deve ser entre 0% e 100%.";
  if (data.nightSurcharge  < 0 || data.nightSurcharge  > 100) return "Adicional noturno deve ser entre 0% e 100%.";
  if (data.weekendSurcharge < 0 || data.weekendSurcharge > 100) return "Adicional de fim de semana deve ser entre 0% e 100%.";
  if (data.minimumPrice < 0)                                   return "Preço mínimo não pode ser negativo.";
  return null;
}

export async function saveFreightConfig(
  data: FreightConfigData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const err = validateFreightConfig(data);
    if (err) return { ok: false, error: err };
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
    if (pricing.basePrice < 0 || pricing.pricePerKm < 0 || pricing.helperPrice < 0 || pricing.additionalStopPrice < 0) {
      return { ok: false };
    }
    await db.vehicleType.update({ where: { id }, data: pricing });
    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err) {
    console.error("[saveVehicleTypePricing]", err);
    return { ok: false };
  }
}
