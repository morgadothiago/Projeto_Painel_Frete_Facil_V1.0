import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock do módulo db
vi.mock("@/lib/db", () => ({
  db: {
    company: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    driver: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock do bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}));

// Mock do next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  getCompanies,
  getDrivers,
  getAllDrivers,
  createDriver,
  updateDriverStatus,
  deleteDriver,
} from "./drivers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const mockAuth = vi.mocked(auth);
const mockDb = vi.mocked(db);
const mockBcrypt = vi.mocked(bcrypt);

describe("drivers - Driver Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCompanies", () => {
    it("should throw error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(getCompanies()).rejects.toThrow("Sem permissão");
    });

    it("should throw error when user is not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
      } as any);
      await expect(getCompanies()).rejects.toThrow("Sem permissão");
    });

    it("should return companies for ADMIN user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);

      const mockCompanies = [
        {
          id: "company-1",
          tradeName: "Empresa A",
          user: { name: "Empresa A LTDA" },
        },
        {
          id: "company-2",
          tradeName: null,
          user: { name: "Empresa B" },
        },
      ];

      (mockDb.company.findMany as any).mockResolvedValue(mockCompanies);

      const result = await getCompanies();
      expect(result).toEqual([
        { id: "company-1", name: "Empresa A" },
        { id: "company-2", name: "Empresa B" },
      ]);
    });

    it("should handle company without tradeName", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);

      const mockCompanies = [
        {
          id: "company-1",
          tradeName: null,
          user: { name: "Empresa sem nome" },
        },
      ];

      (mockDb.company.findMany as any).mockResolvedValue(mockCompanies);

      const result = await getCompanies();
      expect(result[0].name).toBe("Empresa sem nome");
    });
  });

  describe("getDrivers", () => {
    it("should throw error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(getDrivers("company-1")).rejects.toThrow("Não autenticado");
    });

    it("should return drivers for company", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
      } as any);

      const mockDrivers = [
        {
          id: "driver-1",
          userId: "user-2",
          cpf: "12345678901",
          isOnline: true,
          rating: 4.5,
          totalDeliveries: 10,
          autonomo: false,
          user: {
            name: "Motorista 1",
            email: "motorista1@test.com",
            phone: "11999999999",
            status: "ACTIVE",
            createdAt: new Date("2024-01-01"),
          },
        },
      ];

      (mockDb.driver.findMany as any).mockResolvedValue(mockDrivers);

      const result = await getDrivers("company-1");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Motorista 1");
      expect(result[0].status).toBe("ACTIVE");
    });
  });

  describe("getAllDrivers", () => {
    it("should throw error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(getAllDrivers()).rejects.toThrow("Sem permissão");
    });

    it("should throw error when user is not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
      } as any);
      await expect(getAllDrivers()).rejects.toThrow("Sem permissão");
    });

    it("should return all autonomous drivers for ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);

      const mockDrivers = [
        {
          id: "driver-1",
          userId: "user-2",
          cpf: "12345678901",
          isOnline: false,
          rating: 4.0,
          totalDeliveries: 5,
          autonomo: true,
          user: {
            name: "Motorista Autônomo",
            email: "autonomo@test.com",
            phone: null,
            status: "ACTIVE",
            createdAt: new Date("2024-01-01"),
            company: null,
          },
        },
      ];

      (mockDb.driver.findMany as any).mockResolvedValue(mockDrivers);

      const result = await getAllDrivers();
      expect(result).toHaveLength(1);
      expect(result[0].autonomo).toBe(true);
    });
  });

  describe("createDriver", () => {
    it("should return error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });
      expect(result).toEqual({ ok: false, error: "Não autenticado" });
    });

    it("should return error when user is not COMPANY", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);
      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });
      expect(result).toEqual({
        ok: false,
        error: "Apenas empresas podem cadastrar motoristas",
      });
    });

    it("should return error when company not found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY", company: null },
      } as any);

      (mockDb.company.findFirst as any).mockResolvedValue(null);

      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });
      expect(result).toEqual({
        ok: false,
        error: "Empresa não encontrada. Verifique seu cadastro.",
      });
    });

    it("should return error when email already exists", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.findFirst as any).mockResolvedValue({
        id: "existing-user",
        email: "motorista@test.com",
      });

      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });
      expect(result).toEqual({ ok: false, error: "E-mail já cadastrado" });
    });

    it("should return error when CPF already exists", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.findFirst as any).mockResolvedValue(null);
      (mockDb.driver.findFirst as any).mockResolvedValue({
        id: "existing-driver",
        cpf: "12345678901",
      });

      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "123.456.789-01",
        password: "senha123",
      });
      expect(result).toEqual({ ok: false, error: "CPF já cadastrado" });
    });

    it("should create driver successfully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.findFirst as any).mockResolvedValue(null);
      (mockDb.driver.findFirst as any).mockResolvedValue(null);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");
      (mockDb.user.create as any).mockResolvedValue({ id: "new-user" });

      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });

      expect(result).toEqual({ ok: true });
      expect(mockBcrypt.hash).toHaveBeenCalledWith("senha123", 12);
      expect(mockDb.user.create).toHaveBeenCalled();
    });

    it("should strip non-numeric characters from CPF", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.findFirst as any).mockResolvedValue(null);
      (mockDb.driver.findFirst as any).mockResolvedValue(null);
      (mockBcrypt.hash as any).mockResolvedValue("hashed-password");
      (mockDb.user.create as any).mockResolvedValue({ id: "new-user" });

      await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "123.456.789-01",
        password: "senha123",
      });

      expect(mockDb.driver.findFirst).toHaveBeenCalledWith({
        where: { cpf: "12345678901" },
      });
    });
  });

  describe("updateDriverStatus", () => {
    it("should return error when no company found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", company: null },
      } as any);

      const result = await updateDriverStatus("driver-1", "ACTIVE");
      expect(result).toEqual({ ok: false, error: "Empresa não encontrada" });
    });

    it("should update driver status successfully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.update as any).mockResolvedValue({ id: "driver-1" });

      const result = await updateDriverStatus("driver-1", "ACTIVE");
      expect(result).toEqual({ ok: true });
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: "driver-1", company: { id: "company-1" } },
        data: { status: "ACTIVE" },
      });
    });
  });

  describe("deleteDriver", () => {
    it("should return error when no company found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", company: null },
      } as any);

      const result = await deleteDriver("driver-1");
      expect(result).toEqual({ ok: false, error: "Empresa não encontrada" });
    });

    it("should delete driver successfully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          company: { id: "company-1" },
        },
      } as any);

      (mockDb.user.delete as any).mockResolvedValue({ id: "driver-1" });

      const result = await deleteDriver("driver-1");
      expect(result).toEqual({ ok: true });
      expect(mockDb.user.delete).toHaveBeenCalledWith({
        where: { id: "driver-1", company: { id: "company-1" } },
      });
    });
  });
});
