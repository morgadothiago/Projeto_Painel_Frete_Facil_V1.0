import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma le DATABASE_URL do .env automaticamente
const db = new PrismaClient();

async function main() {
  console.log("Populando banco de dados...");

  const hash = (p: string) => bcrypt.hash(p, 10);

  // ── Admin ──────────────────────────────────────────────────────────────────
  await db.user.upsert({
    where:  { email: "admin@fretefacil.com" },
    update: {},
    create: {
      name:     "Admin FreteF",
      email:    "admin@fretefacil.com",
      password: await hash("admin123"),
      role:     "ADMIN",
    },
  });

  // ── Empresa ────────────────────────────────────────────────────────────────
  const companyUser = await db.user.upsert({
    where:  { email: "empresa@fretefacil.com" },
    update: {},
    create: {
      name:     "Empresa Teste",
      email:    "empresa@fretefacil.com",
      password: await hash("empresa123"),
      role:     "COMPANY",
    },
  });

  await db.company.upsert({
    where:  { userId: companyUser.id },
    update: {},
    create: {
      userId:    companyUser.id,
      cnpj:      "00.000.000/0001-00",
      tradeName: "Empresa Teste Ltda",
      address: {
        create: {
          street:       "Rua das Flores",
          number:       "123",
          neighborhood: "Centro",
          city:         "Sao Paulo",
          state:        "SP",
          zipCode:      "01310-100",
        },
      },
    },
  });

  // ── Motorista ──────────────────────────────────────────────────────────────
  const driverUser = await db.user.upsert({
    where:  { email: "motorista@fretefacil.com" },
    update: {},
    create: {
      name:     "Joao Motorista",
      email:    "motorista@fretefacil.com",
      password: await hash("motorista123"),
      role:     "DRIVER",
    },
  });

  // ── Tipos de veiculo ───────────────────────────────────────────────────────
  const moto = await db.vehicleType.upsert({
    where:  { name: "Moto" },
    update: {},
    create: {
      name:                "Moto",
      icon:                "motorcycle",
      description:         "Entregas rapidas e pequenas",
      maxWeight:           30,
      basePrice:           15,
      pricePerKm:          1.5,
      helperPrice:         0,
      additionalStopPrice: 5,
    },
  });

  await db.vehicleType.upsert({
    where:  { name: "Carro" },
    update: {},
    create: {
      name:                "Carro",
      icon:                "car",
      description:         "Pequenos volumes",
      maxWeight:           300,
      basePrice:           25,
      pricePerKm:          2,
      helperPrice:         30,
      additionalStopPrice: 8,
    },
  });

  await db.vehicleType.upsert({
    where:  { name: "Van" },
    update: {},
    create: {
      name:                "Van",
      icon:                "van",
      description:         "Grandes volumes e multiplas paradas",
      maxWeight:           1500,
      basePrice:           60,
      pricePerKm:          3.5,
      helperPrice:         50,
      additionalStopPrice: 15,
    },
  });

  await db.vehicleType.upsert({
    where:  { name: "Caminhao 3/4" },
    update: {},
    create: {
      name:                "Caminhao 3/4",
      icon:                "truck",
      description:         "Cargas medias",
      maxWeight:           4000,
      basePrice:           120,
      pricePerKm:          5,
      helperPrice:         80,
      additionalStopPrice: 25,
    },
  });

  // Vincula motorista ao tipo moto
  await db.driver.upsert({
    where:  { userId: driverUser.id },
    update: {},
    create: {
      userId:  driverUser.id,
      cpf:     "000.000.000-00",
      vehicle: {
        create: {
          vehicleTypeId: moto.id,
          plate:         "ABC-1234",
          model:         "Honda CG 160",
          year:          2022,
          color:         "Vermelho",
        },
      },
      bankAccount: {
        create: {
          bank:       "Nubank",
          agency:     "0001",
          account:    "12345-6",
          pixKey:     "motorista@fretefacil.com",
          pixKeyType: "EMAIL",
        },
      },
    },
  });

  console.log("Seed concluido!");
  console.log("  admin@fretefacil.com    / admin123");
  console.log("  empresa@fretefacil.com  / empresa123");
  console.log("  motorista@fretefacil.com / motorista123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
