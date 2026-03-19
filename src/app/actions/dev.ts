"use server";

import { db }  from "@/lib/db";
import { auth } from "@/auth";

/**
 * Coloca o primeiro motorista disponível online e insere
 * uma posição GPS próxima às coordenadas fornecidas.
 * Apenas para ADMIN.
 */
export async function simulateDriverNear(
  lat: number,
  lng: number,
): Promise<{ ok: boolean; name?: string }> {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return { ok: false };
  }

  try {
    const driver = await db.driver.findFirst({
      include: { user: true },
    });
    if (!driver) return { ok: false };

    // Offset aleatório de até ~300m para não ficar exatamente no pin do admin
    const offset = () => (Math.random() - 0.5) * 0.006;

    await db.driver.update({
      where: { id: driver.id },
      data:  { isOnline: true },
    });

    await db.gpsLocation.create({
      data: {
        driverId: driver.id,
        lat:      lat + offset(),
        lng:      lng + offset(),
        heading:  Math.random() * 360,
        speed:    Math.round(Math.random() * 50),
      },
    });

    return { ok: true, name: driver.user.name };
  } catch (err) {
    console.error("[simulateDriverNear]", err);
    return { ok: false };
  }
}
