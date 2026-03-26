"use server";

import { auth } from "@/auth";
import { api }  from "@/lib/api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type VehicleTypeOption = {
  id:           string;
  name:         string;
  icon:         string;
  vehicleClass: string;
  basePrice:    number;
  pricePerKm:   number;
  maxWeight:    number | null;
  isActive:     boolean;
};

export type EstimateInput = {
  vehicleTypeId:   string;
  distanceKm:      number;
  needsHelper?:    boolean;
  additionalStops?: number;
  scheduledAt?:    string;
};

export type EstimateBreakdown = {
  basePrice:           number;
  distanceFee:         number;
  helperFee:           number;
  stopsFee:            number;
  nightSurchargeFee:   number;
  weekendSurchargeFee: number;
  minimumPriceApplied: boolean;
  platformFee:         number;
  insuranceFee:        number;
};

export type EstimateResult = {
  vehicleType:    { id: string; name: string; icon: string };
  distanceKm:     number;
  estimatedPrice: number;
  breakdown:      EstimateBreakdown;
  config: {
    platformFeePct:   number;
    insuranceFeePct:  number;
    minimumPrice:     number;
    tollReimburse:    boolean;
    nightSurcharge:   number;
    weekendSurcharge: number;
  };
  driverEarnings: number;
};

// ─── Buscar tipos de veículo ativos ──────────────────────────────────────────

export async function getActiveVehicleTypes(): Promise<VehicleTypeOption[]> {
  const session = await auth();
  if (!session) return [];

  try {
    const { data } = await api.get("/api/vehicle-types?active=true");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((v) => ({
      id:           v.id,
      name:         v.name,
      icon:         v.icon ?? "🚚",
      vehicleClass: v.vehicleClass ?? "",
      basePrice:    Number(v.basePrice),
      pricePerKm:   Number(v.pricePerKm),
      maxWeight:    v.maxWeight != null ? Number(v.maxWeight) : null,
      isActive:     v.isActive ?? true,
    }));
  } catch (err) {
    console.error("[getActiveVehicleTypes]", err);
    return [];
  }
}

// ─── Calcular estimativa de frete via API ─────────────────────────────────────

export async function estimateFreight(
  input: EstimateInput,
): Promise<{ ok: true; data: EstimateResult } | { ok: false; error: string }> {
  const session = await auth();
  if (!session) return { ok: false, error: "Não autenticado" };

  try {
    const { data } = await api.post("/api/deliveries/estimate", {
      vehicleTypeId:   input.vehicleTypeId,
      distanceKm:      input.distanceKm,
      needsHelper:     input.needsHelper  ?? false,
      additionalStops: input.additionalStops ?? 0,
      ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
    });

    return { ok: true, data: data as EstimateResult };
  } catch (err) {
    console.error("[estimateFreight]", err);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (err as any)?.response?.data?.message ?? "Erro ao calcular estimativa";
    return { ok: false, error: msg };
  }
}
