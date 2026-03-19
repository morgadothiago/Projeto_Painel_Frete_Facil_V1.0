/**
 * Script de teste para simular motoristas livres no mapa.
 * Roda contra o banco configurado no DATABASE_URL (.env).
 *
 * Uso:
 *   npx tsx prisma/seed-map-test.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Coordenadas de São Paulo — ajuste para sua cidade se preferir
const SP_LOCATIONS: { lat: number; lng: number; label: string }[] = [
  { lat: -23.5505, lng: -46.6333, label: "Centro SP"         },
  { lat: -23.5630, lng: -46.6544, label: "Pinheiros"         },
  { lat: -23.5489, lng: -46.6388, label: "Paulista"          },
  { lat: -23.5875, lng: -46.6824, label: "Vila Madalena"     },
  { lat: -23.6101, lng: -46.6970, label: "Santo Amaro"       },
];

async function main() {
  console.log("🗺  Configurando motoristas de teste no mapa...\n");

  // Busca o motorista do seed (pode haver mais de um)
  const drivers = await db.driver.findMany({
    include: { user: true, vehicle: { include: { vehicleType: true } } },
    take: 5,
  });

  if (drivers.length === 0) {
    console.log("❌ Nenhum motorista encontrado. Rode primeiro: npx prisma db seed");
    return;
  }

  for (let i = 0; i < drivers.length; i++) {
    const driver   = drivers[i];
    const location = SP_LOCATIONS[i % SP_LOCATIONS.length];

    // Marca como online
    await db.driver.update({
      where: { id: driver.id },
      data:  { isOnline: true },
    });

    // Insere uma posição GPS
    await db.gpsLocation.create({
      data: {
        driverId: driver.id,
        lat:      location.lat,
        lng:      location.lng,
        heading:  Math.random() * 360,
        speed:    Math.random() * 60,
      },
    });

    console.log(`✅ ${driver.user.name} → online em ${location.label} (${location.lat}, ${location.lng})`);
  }

  console.log("\n✅ Pronto! Abra o mapa em /dashboard/mapa para ver os motoristas.");
  console.log("   Para desligar os motoristas novamente, rode:");
  console.log("   npx tsx prisma/seed-map-reset.ts\n");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
