"use server";

import { db }   from "@/lib/db";
import { auth }  from "@/auth";

export async function pushGpsLocation(
  lat: number,
  lng: number,
  heading?: number,
  speed?: number,
  deliveryId?: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  try {
    const driver = await db.driver.findUnique({
      where:  { userId: session.user.id },
      select: { id: true },
    });
    if (!driver) return { ok: false };

    await db.gpsLocation.create({
      data: {
        driverId:   driver.id,
        lat,
        lng,
        heading:    heading ?? null,
        speed:      speed ?? null,
        deliveryId: deliveryId ?? null,
      },
    });

    // Mantém apenas as últimas 200 posições por motorista para não crescer indefinidamente
    const old = await db.gpsLocation.findMany({
      where:   { driverId: driver.id },
      orderBy: { createdAt: "desc" },
      skip:    200,
      select:  { id: true },
    });
    if (old.length > 0) {
      await db.gpsLocation.deleteMany({
        where: { id: { in: old.map((o) => o.id) } },
      });
    }

    return { ok: true };
  } catch (err) {
    console.error("[pushGpsLocation] error:", err);
    return { ok: false };
  }
}

export async function setDriverOnline(online: boolean): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };

  try {
    await db.driver.update({
      where: { userId: session.user.id },
      data:  { isOnline: online },
    });
    return { ok: true };
  } catch (err) {
    console.error("[setDriverOnline] error:", err);
    return { ok: false };
  }
}
