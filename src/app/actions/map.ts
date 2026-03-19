"use server";

import { db }   from "@/lib/db";
import { auth }  from "@/auth";

export type MapDriver = {
  id:      string;
  name:    string;
  phone:   string | null;
  rating:  number;
  lat:     number;
  lng:     number;
  heading: number;
  vehicle: string | null;
  plate:   string | null;
};

export type MapDelivery = {
  id:          string;
  publicId:    string;
  company:     string;
  description: string | null;
  originLat:   number;
  originLng:   number;
  originCity:  string;
  destCity:    string;
};

export type MapData = {
  drivers:    MapDriver[];
  deliveries: MapDelivery[];
};

const ACTIVE_STATUSES = ["ACCEPTED", "COLLECTING", "IN_TRANSIT"];

export async function getMapData(): Promise<MapData> {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return { drivers: [], deliveries: [] };
  }

  try {
    // Motoristas online não atribuídos a entrega ativa
    const busyDriverIds = (
      await db.delivery.findMany({
        where:  { status: { in: ACTIVE_STATUSES }, driverId: { not: null } },
        select: { driverId: true },
      })
    ).map((d) => d.driverId as string);

    const drivers = await db.driver.findMany({
      where: {
        isOnline: true,
        user:     { status: "ACTIVE" },
        id:       { notIn: busyDriverIds },
      },
      include: {
        user:     { select: { name: true, phone: true } },
        vehicle:  { include: { vehicleType: true } },
        locations: {
          orderBy: { createdAt: "desc" },
          take:    1,
        },
        address: true,
      },
    });

    const mapDrivers: MapDriver[] = drivers
      .map((d) => {
        const loc = d.locations[0];
        const lat = loc?.lat ?? d.address?.lat;
        const lng = loc?.lng ?? d.address?.lng;
        if (!lat || !lng) return null;
        return {
          id:      d.id,
          name:    d.user.name,
          phone:   d.user.phone ?? null,
          rating:  d.rating,
          lat,
          lng,
          heading: loc?.heading ?? 0,
          vehicle: d.vehicle?.vehicleType?.name ?? null,
          plate:   d.vehicle?.plate ?? null,
        };
      })
      .filter(Boolean) as MapDriver[];

    // Entregas pendentes com coordenadas de origem
    const deliveries = await db.delivery.findMany({
      where: {
        status:    "PENDING",
        originLat: { not: null },
        originLng: { not: null },
      },
      include: {
        company: { select: { tradeName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mapDeliveries: MapDelivery[] = deliveries.map((d) => ({
      id:          d.id,
      publicId:    d.publicId,
      company:     d.company.tradeName ?? "—",
      description: d.cargoDescription ?? null,
      originLat:   d.originLat!,
      originLng:   d.originLng!,
      originCity:  d.originCity,
      destCity:    d.destinationCity,
    }));

    return { drivers: mapDrivers, deliveries: mapDeliveries };
  } catch (err) {
    console.error("[getMapData] error:", err);
    return { drivers: [], deliveries: [] };
  }
}
