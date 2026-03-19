"use server";

import { db }            from "@/lib/db";
import { auth }          from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt            from "bcryptjs";

export type DriverRow = {
  id:              string;
  userId:          string;
  cpf:             string;
  name:            string;
  email:           string;
  phone:           string | null;
  isOnline:        boolean;
  rating:          number;
  totalDeliveries: number;
  status:          string;
  autonomo:        boolean;
  createdAt:       Date;
};

export async function getCompanies() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão");
  }

  const companies = await db.company.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return companies.map((c) => ({
    id: c.id,
    name: c.tradeName || c.user.name || "Empresa sem nome",
  }));
}

export async function getDrivers(companyId: string): Promise<DriverRow[]> {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const drivers = await db.driver.findMany({
    where: {
      companyId: companyId,
    },
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  });

  return drivers.map((d) => ({
    id:              d.id,
    userId:          d.userId,
    cpf:             d.cpf,
    name:            d.user.name,
    email:           d.user.email,
    phone:           d.user.phone,
    isOnline:        d.isOnline,
    rating:          d.rating,
    totalDeliveries: d.totalDeliveries,
    status:          d.user.status,
    autonomo:        d.autonomo,
    createdAt:       d.user.createdAt,
  }));
}

export async function getAllDrivers(): Promise<DriverRow[]> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão");
  }

  const drivers = await db.driver.findMany({
    where:   { autonomo: true },
    include: { user: { include: { company: true } } },
    orderBy: { user: { createdAt: "desc" } },
  });

  return drivers.map((d) => ({
    id:              d.id,
    userId:          d.userId,
    cpf:             d.cpf,
    name:            d.user.name,
    email:           d.user.email,
    phone:           d.user.phone,
    isOnline:        d.isOnline,
    rating:          d.rating,
    totalDeliveries: d.totalDeliveries,
    status:          d.user.status,
    autonomo:        d.autonomo,
    createdAt:       d.user.createdAt,
  }));
}

export async function createDriver(data: {
  name:     string;
  email:    string;
  cpf:      string;
  phone?:   string;
  password: string;
}) {
  const session = await auth();
  if (!session) {
    return { ok: false, error: "Não autenticado" };
  }

  if (session.user.role !== "COMPANY") {
    return { ok: false, error: "Apenas empresas podem cadastrar motoristas" };
  }

  let companyId = session.user.company?.id;

  if (!companyId) {
    const company = await db.company.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });
    companyId = company?.id;
  }

  if (!companyId) {
    return { ok: false, error: "Empresa não encontrada. Verifique seu cadastro." };
  }

  const existingUser = await db.user.findFirst({
    where: { email: data.email },
  });

  if (existingUser) {
    return { ok: false, error: "E-mail já cadastrado" };
  }

  const existingCpf = await db.driver.findFirst({
    where: { cpf: data.cpf.replace(/\D/g, "") },
  });

  if (existingCpf) {
    return { ok: false, error: "CPF já cadastrado" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await db.user.create({
    data: {
      name:     data.name,
      email:    data.email,
      phone:    data.phone,
      password: hashedPassword,
      role:     "DRIVER",
      status:   "PENDING",
      company:  {
        connect: { id: companyId },
      },
      driver: {
        create: {
          cpf: data.cpf.replace(/\D/g, ""),
          autonomo: false, // vinculado à empresa
          companyId: companyId,
        },
      },
    },
  });

  revalidatePath("/dashboard/motoristas");
  return { ok: true };
}

export async function updateDriverStatus(userId: string, status: string) {
  const session = await auth();
  if (!session?.user?.company?.id) {
    return { ok: false, error: "Empresa não encontrada" };
  }

  await db.user.update({
    where: { 
      id: userId,
      company: { id: session.user.company.id },
    },
    data:  { status },
  });

  revalidatePath("/dashboard/motoristas");
  return { ok: true };
}

export async function deleteDriver(userId: string) {
  const session = await auth();
  if (!session?.user?.company?.id) {
    return { ok: false, error: "Empresa não encontrada" };
  }

  await db.user.delete({
    where: { 
      id: userId,
      company: { id: session.user.company.id },
    },
  });

  revalidatePath("/dashboard/motoristas");
  return { ok: true };
}