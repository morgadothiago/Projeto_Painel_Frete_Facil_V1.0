"use server";

import { db }             from "@/lib/db";
import { auth }           from "@/auth";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | "PENDING"
  | "ACCEPTED"
  | "COLLECTING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type DeliveryRow = {
  id:            string;
  publicId:      string;
  companyId:     string;
  companyName:   string;
  driverId:      string | null;
  driverName:    string | null;
  vehicleTypeId: string;
  vehicleTypeName: string;
  vehicleTypeIcon: string;
  vehicleClass:  string;
  status:        DeliveryStatus;

  originStreet:       string;
  originNumber:       string;
  originNeighborhood: string;
  originCity:         string;
  originState:        string;
  originZipCode:      string;
  originLat:          number | null;
  originLng:          number | null;

  destinationStreet:       string;
  destinationNumber:       string;
  destinationNeighborhood: string;
  destinationCity:         string;
  destinationState:        string;
  destinationZipCode:      string;
  destinationLat:          number | null;
  destinationLng:          number | null;

  cargoDescription:  string | null;
  weight:            number | null;
  needsHelper:       boolean;
  additionalStops:   number;
  notes:             string | null;
  scheduledAt:       string | null;
  estimatedPrice:    number | null;
  finalPrice:        number | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateDeliveryPayload = {
  companyId:     string;
  vehicleTypeId: string;

  originStreet:       string;
  originNumber:       string;
  originNeighborhood: string;
  originCity:         string;
  originState:        string;
  originZipCode:      string;
  originLat:          number | null;
  originLng:          number | null;

  destinationStreet:       string;
  destinationNumber:       string;
  destinationNeighborhood: string;
  destinationCity:         string;
  destinationState:        string;
  destinationZipCode:      string;
  destinationLat:          number | null;
  destinationLng:          number | null;

  cargoDescription:  string;
  weight:            number | null;
  needsHelper:       boolean;
  additionalStops:   number;
  notes:             string;
  scheduledAt:       string | null;
  estimatedPrice:    number | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
};

// ── Guard ──────────────────────────────────────────────────────────────────────

async function assertAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Sem permissão");
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toRow(d: {
  id:            string;
  publicId:      string;
  companyId:     string;
  driverId:      string | null;
  vehicleTypeId: string;
  status:        string;
  originStreet:       string;
  originNumber:       string;
  originNeighborhood: string;
  originCity:         string;
  originState:        string;
  originZipCode:      string;
  originLat:          number | null;
  originLng:          number | null;
  destinationStreet:       string;
  destinationNumber:       string;
  destinationNeighborhood: string;
  destinationCity:         string;
  destinationState:        string;
  destinationZipCode:      string;
  destinationLat:          number | null;
  destinationLng:          number | null;
  cargoDescription:  string | null;
  weight:            number | null;
  needsHelper:       boolean;
  additionalStops:   number;
  notes:             string | null;
  scheduledAt:       Date | null;
  estimatedPrice:    { toNumber(): number } | null;
  finalPrice:        { toNumber(): number } | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  createdAt: Date;
  updatedAt: Date;
  company:     { user: { name: string } };
  driver:      { user: { name: string } } | null;
  vehicleType: { name: string; icon: string; vehicleClass: string };
}): DeliveryRow {
  return {
    id:            d.id,
    publicId:      d.publicId,
    companyId:     d.companyId,
    companyName:   d.company.user.name,
    driverId:      d.driverId,
    driverName:    d.driver?.user.name ?? null,
    vehicleTypeId: d.vehicleTypeId,
    vehicleTypeName: d.vehicleType.name,
    vehicleTypeIcon: d.vehicleType.icon,
    vehicleClass:    d.vehicleType.vehicleClass,
    status:        d.status as DeliveryStatus,

    originStreet:       d.originStreet,
    originNumber:       d.originNumber,
    originNeighborhood: d.originNeighborhood,
    originCity:         d.originCity,
    originState:        d.originState,
    originZipCode:      d.originZipCode,
    originLat:          d.originLat,
    originLng:          d.originLng,

    destinationStreet:       d.destinationStreet,
    destinationNumber:       d.destinationNumber,
    destinationNeighborhood: d.destinationNeighborhood,
    destinationCity:         d.destinationCity,
    destinationState:        d.destinationState,
    destinationZipCode:      d.destinationZipCode,
    destinationLat:          d.destinationLat,
    destinationLng:          d.destinationLng,

    cargoDescription:  d.cargoDescription,
    weight:            d.weight,
    needsHelper:       d.needsHelper,
    additionalStops:   d.additionalStops,
    notes:             d.notes,
    scheduledAt:       d.scheduledAt ? d.scheduledAt.toISOString() : null,
    estimatedPrice:    d.estimatedPrice ? d.estimatedPrice.toNumber() : null,
    finalPrice:        d.finalPrice    ? d.finalPrice.toNumber()    : null,
    estimatedDistance: d.estimatedDistance,
    estimatedDuration: d.estimatedDuration,

    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

const INCLUDE = {
  company:     { include: { user: true } },
  driver:      { include: { user: true } },
  vehicleType: true,
} as const;

// ── Actions ────────────────────────────────────────────────────────────────────

export async function getDeliveries(): Promise<DeliveryRow[]> {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN") return [];

    const rows = await db.delivery.findMany({
      orderBy: { createdAt: "desc" },
      include: INCLUDE,
    });

    return rows.map(toRow);
  } catch {
    return [];
  }
}

export async function createDelivery(
  data: CreateDeliveryPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();

    const publicId = `FF-${Date.now().toString(36).toUpperCase()}`;

    await db.delivery.create({
      data: {
        publicId,
        companyId:     data.companyId,
        vehicleTypeId: data.vehicleTypeId,
        status:        "PENDING",

        originStreet:       data.originStreet,
        originNumber:       data.originNumber,
        originNeighborhood: data.originNeighborhood,
        originCity:         data.originCity,
        originState:        data.originState,
        originZipCode:      data.originZipCode,
        originLat:          data.originLat ?? undefined,
        originLng:          data.originLng ?? undefined,

        destinationStreet:       data.destinationStreet,
        destinationNumber:       data.destinationNumber,
        destinationNeighborhood: data.destinationNeighborhood,
        destinationCity:         data.destinationCity,
        destinationState:        data.destinationState,
        destinationZipCode:      data.destinationZipCode,
        destinationLat:          data.destinationLat ?? undefined,
        destinationLng:          data.destinationLng ?? undefined,

        cargoDescription:  data.cargoDescription  || null,
        weight:            data.weight             ?? undefined,
        needsHelper:       data.needsHelper,
        additionalStops:   data.additionalStops,
        notes:             data.notes              || null,
        scheduledAt:       data.scheduledAt ? new Date(data.scheduledAt) : null,
        estimatedPrice:    data.estimatedPrice    ?? undefined,
        estimatedDistance: data.estimatedDistance ?? undefined,
        estimatedDuration: data.estimatedDuration ?? undefined,
      },
    });

    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[createDelivery]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg.slice(0, 120) };
  }
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    await db.delivery.update({ where: { id }, data: { status } });
    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[updateDeliveryStatus]", err);
    return { ok: false, error: "Erro ao atualizar status." };
  }
}

export async function cancelDelivery(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    await db.delivery.update({ where: { id }, data: { status: "CANCELLED" } });
    revalidatePath("/dashboard/fretes");
    return { ok: true };
  } catch (err: unknown) {
    console.error("[cancelDelivery]", err);
    return { ok: false, error: "Erro ao cancelar frete." };
  }
}
