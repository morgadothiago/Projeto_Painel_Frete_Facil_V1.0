/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get:    vi.fn(),
    post:   vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}));

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
import { api } from "@/lib/api";

const mockAuth = vi.mocked(auth);
const mockApi  = vi.mocked(api);

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

      (mockApi.get as any).mockResolvedValue({
        data: {
          data: [
            { id: "company-1", tradeName: "Empresa A", user: { name: "Empresa A LTDA" } },
            { id: "company-2", tradeName: null,        user: { name: "Empresa B" } },
          ],
        },
      });

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

      (mockApi.get as any).mockResolvedValue({
        data: {
          data: [{ id: "company-1", tradeName: null, user: { name: "Empresa sem nome" } }],
        },
      });

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

      (mockApi.get as any).mockResolvedValue({
        data: {
          data: [{
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
              createdAt: "2024-01-01T00:00:00Z",
            },
          }],
        },
      });

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

    it("should return all drivers for ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);

      (mockApi.get as any).mockResolvedValue({
        data: {
          data: [{
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
              createdAt: "2024-01-01T00:00:00Z",
            },
          }],
        },
      });

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

    it("should create driver successfully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockApi.post as any).mockResolvedValue({ data: { id: "new-driver" } });

      const result = await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        password: "senha123",
      });

      expect(result).toEqual({ ok: true });
      expect(mockApi.post).toHaveBeenCalledWith("/api/drivers", {
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "12345678901",
        phone: undefined,
        password: "senha123",
        autonomo: false,
      });
    });

    it("should strip non-numeric characters from CPF", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
      } as any);

      (mockApi.post as any).mockResolvedValue({ data: { id: "new-driver" } });

      await createDriver({
        name: "Motorista",
        email: "motorista@test.com",
        cpf: "123.456.789-01",
        password: "senha123",
      });

      expect(mockApi.post).toHaveBeenCalledWith("/api/drivers", expect.objectContaining({
        cpf: "12345678901",
      }));
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

      (mockApi.patch as any).mockResolvedValue({ data: {} });

      const result = await updateDriverStatus("driver-1", "ACTIVE");
      expect(result).toEqual({ ok: true });
      expect(mockApi.patch).toHaveBeenCalledWith("/api/drivers/driver-1/status", { status: "ACTIVE" });
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

      (mockApi.delete as any).mockResolvedValue({ data: {} });

      const result = await deleteDriver("driver-1");
      expect(result).toEqual({ ok: true });
      expect(mockApi.delete).toHaveBeenCalledWith("/api/drivers/driver-1");
    });
  });
});
