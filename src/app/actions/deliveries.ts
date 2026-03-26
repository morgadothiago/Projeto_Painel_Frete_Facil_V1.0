"use server";

import { auth } from "@/auth";
import { api } from "@/lib/api";

// ─── Tipos públicos ─────────────────────────────────────────────────────────

export type DeliveryStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type Delivery = {
  id: string;
  publicId: string;
  status: DeliveryStatus;
  originAddress: string;
  originLat: number;
  originLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  estimatedPrice: string | number;
  finalPrice: string | number | null;
  estimatedDistance: number | null;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  scheduledAt: string | null;
  cargoDescription: string | null;
  weight: number | null;
  needsHelper: boolean;
  additionalStops: number;
  driver: {
    id: string;
    name: string;
    phone: string | null;
    rating: number;
    location: {
      id: string;
      lat: number;
      lng: number;
      heading: number | null;
      speed: number | null;
      timestamp: string;
    } | null;
  } | null;
  company: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  vehicleType: {
    name: string;
    icon: string;
  };
};

export type DeliveryStats = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
};

// ─── Mapper: resposta bruta da API → tipo Delivery do frontend ──────────────
// A API retorna driver.user.name, driver.vehicle, etc.
// O frontend espera driver.name diretamente.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDelivery(raw: any): Delivery {
  return {
    id:                raw.id,
    publicId:          raw.publicId,
    status:            raw.status,
    originAddress:     raw.originAddress,
    originLat:         raw.originLat,
    originLng:         raw.originLng,
    destAddress:       raw.destAddress,
    destLat:           raw.destLat,
    destLng:           raw.destLng,
    estimatedPrice:    raw.estimatedPrice,
    finalPrice:        raw.finalPrice ?? null,
    estimatedDistance: raw.estimatedDistance ?? null,
    rating:            raw.rating ?? null,
    comment:           raw.comment ?? null,
    createdAt:         raw.createdAt,
    scheduledAt:       raw.scheduledAt ?? null,
    cargoDescription:  raw.cargoDescription ?? null,
    weight:            raw.weight ?? null,
    needsHelper:       raw.needsHelper ?? false,
    additionalStops:   raw.additionalStops ?? 0,
    vehicleType: {
      name: raw.vehicleType?.name ?? "—",
      icon: raw.vehicleType?.icon ?? "📦",
    },
    driver: raw.driver
      ? {
          id:     raw.driver.id,
          name:   raw.driver.user?.name ?? raw.driver.name ?? "Motorista",
          phone:  raw.driver.user?.phone ?? raw.driver.phone ?? null,
          rating: Number(raw.driver.rating ?? 0),
          location: raw.driver.gpsLocations?.[0] ?? raw.driver.location ?? null,
        }
      : null,
    company: raw.company
      ? {
          id:    raw.company.id,
          name:  raw.company.tradeName ?? raw.company.user?.name ?? "Empresa",
          email: raw.company.user?.email ?? null,
          phone: raw.company.user?.phone ?? null,
        }
      : null,
  };
}

// ─── Helper: base do endpoint conforme role ──────────────────────────────────

async function baseEndpoint() {
  const session = await auth();
  if (!session) return null;
  const role = (session.user as { role?: string }).role;
  return role === "ADMIN" ? "/api/deliveries" : "/api/deliveries/company";
}

// ─── Buscar entregas paginadas ───────────────────────────────────────────────

export async function getCompanyDeliveries(params?: {
  status?: string;
  period?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Delivery[]; total: number; stats: DeliveryStats }> {
  const empty = {
    data: [] as Delivery[],
    total: 0,
    stats: { total: 0, completed: 0, pending: 0, inProgress: 0, cancelled: 0 },
  };

  const base = await baseEndpoint();
  if (!base) return empty;

  try {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "ALL") qs.set("status", params.status);
    qs.set("page",  String(params?.page  ?? 1));
    qs.set("limit", String(params?.limit ?? 10));

    const { data } = await api.get(`${base}?${qs}`);
    const raw: unknown[] = data.data ?? [];
    const deliveries = raw.map(mapDelivery);

    // stats calculados só da página atual (usado como fallback)
    const stats: DeliveryStats = {
      total:      data.total ?? deliveries.length,
      completed:  deliveries.filter(d => d.status === "COMPLETED").length,
      pending:    deliveries.filter(d => d.status === "PENDING").length,
      inProgress: deliveries.filter(d => d.status === "IN_PROGRESS" || d.status === "ACCEPTED").length,
      cancelled:  deliveries.filter(d => d.status === "CANCELLED").length,
    };

    return { data: deliveries, total: data.total ?? deliveries.length, stats };
  } catch (err) {
    console.error("[getCompanyDeliveries]", err);
    return empty;
  }
}

// ─── Buscar contadores globais (5 chamadas paralelas com limit=1) ────────────
// Cada chamada retorna apenas o campo `total` do status — sem trafegar dados

export async function getDeliveryStats(): Promise<DeliveryStats> {
  const zero = { total: 0, completed: 0, pending: 0, inProgress: 0, cancelled: 0 };

  const base = await baseEndpoint();
  if (!base) return zero;

  try {
    const count = async (status?: string) => {
      const qs = new URLSearchParams({ page: "1", limit: "1" });
      if (status) qs.set("status", status);
      const { data } = await api.get(`${base}?${qs}`);
      return (data.total as number) ?? 0;
    };

    const [total, completed, pending, inProgress, accepted, cancelled] =
      await Promise.all([
        count(),
        count("COMPLETED"),
        count("PENDING"),
        count("IN_PROGRESS"),
        count("ACCEPTED"),
        count("CANCELLED"),
      ]);

    return {
      total,
      completed,
      pending,
      inProgress: inProgress + accepted,
      cancelled,
    };
  } catch (err) {
    console.error("[getDeliveryStats]", err);
    return zero;
  }
}

// ─── Entregas em curso (para mapa) ──────────────────────────────────────────

export async function getActiveDeliveries(): Promise<Delivery[]> {
  const base = await baseEndpoint();
  if (!base) return [];

  try {
    const { data } = await api.get(`${base}?status=IN_PROGRESS&limit=100`);
    return (data.data ?? []).map(mapDelivery);
  } catch {
    return [];
  }
}

// ─── Simulação de entrega ────────────────────────────────────────────────────

export async function startSimulation(): Promise<{ deliveryId: string; driverName: string; totalSteps: number } | null> {
  const session = await auth();
  if (!session) return null;
  try {
    const { data } = await api.post("/api/deliveries/simulate/start", {});
    return data;
  } catch (err) {
    console.error("[startSimulation]", err);
    return null;
  }
}

export async function stopSimulation(): Promise<boolean> {
  const session = await auth();
  if (!session) return false;
  try {
    await api.delete("/api/deliveries/simulate/stop");
    return true;
  } catch (err) {
    console.error("[stopSimulation]", err);
    return false;
  }
}

export async function getSimulationStatus(): Promise<{ running: string[] }> {
  const session = await auth();
  if (!session) return { running: [] };
  try {
    const { data } = await api.get("/api/deliveries/simulate/status");
    return data;
  } catch {
    return { running: [] };
  }
}

// ─── Fretes finalizados/cancelados (histórico) ──────────────────────────────

export type FretesHistoricoParams = {
  status?: string;           // "COMPLETED" | "CANCELLED" | "ALL"
  vehicleTypeId?: string;    // filtro por tipo de veículo (client-side)
  q?: string;                // busca por texto (client-side)
  page?: number;
  limit?: number;
};

export type FretesHistoricoResult = {
  data: Delivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function matchesFilters(d: Delivery, params?: FretesHistoricoParams): boolean {
  if (params?.vehicleTypeId) {
    // vehicleType.id não vem no mapDelivery, mas podemos pular esse filtro por enquanto
    // já que a API não retorna vehicleTypeId no delivery
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    const text = [
      d.publicId,
      d.originAddress,
      d.destAddress,
      d.driver?.name ?? "",
    ].join(" ").toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

export async function getFretesHistorico(
  params?: FretesHistoricoParams,
): Promise<FretesHistoricoResult> {
  const empty: FretesHistoricoResult = {
    data: [], total: 0, page: 1, limit: 10, totalPages: 0,
  };

  const base = await baseEndpoint();
  if (!base) return empty;

  const limit = params?.limit ?? 10;
  const page  = params?.page  ?? 1;

  try {
    // API aceita apenas 1 status por vez
    const statuses = params?.status && params.status !== "ALL"
      ? [params.status]
      : ["COMPLETED", "CANCELLED"];

    // Busca grande para ter dados suficientes para filtrar e paginar
    const fetchLimit = Math.max(limit * 5, 50);

    const fetchByStatus = async (status: string) => {
      const qs = new URLSearchParams({ page: "1", limit: String(fetchLimit), status });
      const { data } = await api.get(`${base}?${qs}`);
      const raw: unknown[] = data.data ?? [];
      return {
        items: raw.map(mapDelivery),
        total: data.total as number,
      };
    };

    const results = await Promise.all(statuses.map(fetchByStatus));

    // Junta e remove duplicatas
    const seen = new Set<string>();
    let all: Delivery[] = [];
    for (const r of results) {
      for (const d of r.items) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          all.push(d);
        }
      }
    }

    // Ordena por data decrescente
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filtro por texto (client-side, já que a API não suporta q=)
    if (params?.q) {
      all = all.filter(d => matchesFilters(d, params));
    }

    // Paginação client-side
    const total = all.length;
    const start = (page - 1) * limit;
    const data  = all.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("[getFretesHistorico]", err);
    return empty;
  }
}

// ─── Localização em tempo real ───────────────────────────────────────────────

export async function getDeliveryLocation(
  deliveryId: string,
): Promise<{
  deliveryId: string;
  driverName: string;
  isOnline: boolean;
  location: {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
    timestamp: string;
  } | null;
} | null> {
  const session = await auth();
  if (!session) return null;

  try {
    const { data } = await api.get(`/api/gps/delivery/${deliveryId}`);
    return data;
  } catch {
    return null;
  }
}
