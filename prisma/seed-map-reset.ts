/**
 * Desliga todos os motoristas (isOnline = false) para limpar o teste.
 *
 * Uso:
 *   npx tsx prisma/seed-map-reset.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const { count } = await db.driver.updateMany({
    where: { isOnline: true },
    data:  { isOnline: false },
  });
  console.log(`✅ ${count} motorista(s) marcado(s) como offline.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
