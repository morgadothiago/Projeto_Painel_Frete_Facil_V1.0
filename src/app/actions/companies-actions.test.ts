import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock do next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock do mailer
vi.mock("@/lib/mailer", () => ({
  sendAccountPendingEmail: vi.fn(),
  sendAccountBlockedEmail: vi.fn(),
  sendAccountActivatedEmail: vi.fn(),
}));

import {
  getCompanies,
  updateCompanyStatus,
  createCompanyAction,
  getCompanyDetails,
  isCompanyProfileComplete,
  completeCompanyProfile,
  getCompanyPayments,
  getPaymentStats,
  createPayment,
  markPaymentAsPaid,
} from "./companies";
import { auth } from "@/auth";
import {
  sendAccountPendingEmail,
  sendAccountBlockedEmail,
  sendAccountActivatedEmail,
} from "@/lib/mailer";

const mockAuth = vi.mocked(auth);
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("companies - Company Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3001";
  });

  describe("getCompanies", () => {
    it("should throw error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      await expect(getCompanies()).rejects.toThrow("Sem permissão");
    });

    it("should throw error when user is not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);
      await expect(getCompanies()).rejects.toThrow("Sem permissão");
    });

    it("should return companies for ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "company-1",
              cnpj: "12345678000190",
              tradeName: "Empresa A",
              user: {
                id: "user-2",
                name: "Empresa A LTDA",
                email: "empresa@test.com",
                phone: "11999999999",
                status: "ACTIVE",
                createdAt: "2024-01-01",
              },
            },
          ],
        }),
      });

      const result = await getCompanies();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Empresa A LTDA");
      expect(result[0].status).toBe("ACTIVE");
    });

    it("should return empty array on API error", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getCompanies();
      expect(result).toEqual([]);
    });

    it("should return empty array on network error", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getCompanies();
      expect(result).toEqual([]);
    });
  });

  describe("updateCompanyStatus", () => {
    it("should return error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await updateCompanyStatus("company-1", "ACTIVE");
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should return error when user is not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);
      const result = await updateCompanyStatus("company-1", "ACTIVE");
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should update status to PENDING and send email", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                email: "empresa@test.com",
                name: "Empresa Teste",
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const result = await updateCompanyStatus("company-1", "PENDING");
      expect(result).toEqual({ ok: true });
      expect(sendAccountPendingEmail).toHaveBeenCalledWith(
        "empresa@test.com",
        "Empresa Teste"
      );
    });

    it("should update status to INACTIVE and send blocked email", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                email: "empresa@test.com",
                name: "Empresa Teste",
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const result = await updateCompanyStatus("company-1", "INACTIVE");
      expect(result).toEqual({ ok: true });
      expect(sendAccountBlockedEmail).toHaveBeenCalledWith(
        "empresa@test.com",
        "Empresa Teste"
      );
    });

    it("should update status to ACTIVE and send activated email", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                email: "empresa@test.com",
                name: "Empresa Teste",
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const result = await updateCompanyStatus("company-1", "ACTIVE");
      expect(result).toEqual({ ok: true });
      expect(sendAccountActivatedEmail).toHaveBeenCalledWith(
        "empresa@test.com",
        "Empresa Teste"
      );
    });

    it("should return error on API failure", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { user: { email: "test@test.com", name: "Test" } },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: "Erro ao atualizar" }),
        });

      const result = await updateCompanyStatus("company-1", "ACTIVE");
      expect(result.ok).toBe(false);
    });

    it("should handle email sending error gracefully", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      (sendAccountPendingEmail as any).mockRejectedValueOnce(
        new Error("Email error")
      );

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                email: "empresa@test.com",
                name: "Empresa Teste",
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const result = await updateCompanyStatus("company-1", "PENDING");
      expect(result).toEqual({ ok: true });
    });
  });

  describe("createCompanyAction", () => {
    it("should return error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await createCompanyAction({
        name: "Empresa",
        email: "empresa@test.com",
        password: "senha123",
        tradeName: "Empresa",
        cnpj: "12345678000190",
      });
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should create company successfully", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "company-1" }),
      });

      const result = await createCompanyAction({
        name: "Empresa",
        email: "empresa@test.com",
        password: "senha123",
        tradeName: "Empresa",
        cnpj: "12345678000190",
      });

      expect(result).toEqual({ ok: true });
    });

    it("should return error on API failure", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Erro ao criar" }),
      });

      const result = await createCompanyAction({
        name: "Empresa",
        email: "empresa@test.com",
        password: "senha123",
        tradeName: "Empresa",
        cnpj: "12345678000190",
      });

      expect(result.ok).toBe(false);
    });
  });

  describe("getCompanyDetails", () => {
    it("should return null when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getCompanyDetails("company-1");
      expect(result).toBeNull();
    });

    it("should return company details for ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      const mockCompany = {
        id: "company-1",
        cnpj: "12345678000190",
        tradeName: "Empresa",
        addresses: [],
        user: { id: "user-2", name: "Empresa", email: "test@test.com" },
        _count: { deliveries: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompany,
      });

      const result = await getCompanyDetails("company-1");
      expect(result).toEqual(mockCompany);
    });

    it("should return company details for COMPANY role using /me endpoint", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "company-1" }),
      });

      const result = await getCompanyDetails("company-1");
      expect(result).not.toBeNull();
    });

    it("should return null for DRIVER role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "DRIVER" },
        accessToken: "token-123",
      } as any);

      const result = await getCompanyDetails("company-1");
      expect(result).toBeNull();
    });
  });

  describe("isCompanyProfileComplete", () => {
    it("should return true when not COMPANY role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      const result = await isCompanyProfileComplete();
      expect(result).toBe(true);
    });

    it("should return true when no session", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await isCompanyProfileComplete();
      expect(result).toBe(true);
    });

    it("should return true when company has addresses", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          addresses: [{ id: "addr-1" }],
        }),
      });

      const result = await isCompanyProfileComplete();
      expect(result).toBe(true);
    });

    it("should return false when company has no addresses", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          addresses: [],
        }),
      });

      const result = await isCompanyProfileComplete();
      expect(result).toBe(false);
    });
  });

  describe("completeCompanyProfile", () => {
    it("should return error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await completeCompanyProfile({
        street: "Rua",
        number: "123",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "SP",
        zipCode: "12345678",
      });
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should return error when not COMPANY role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      const result = await completeCompanyProfile({
        street: "Rua",
        number: "123",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "SP",
        zipCode: "12345678",
      });
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should return error when no company found", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY", company: null },
        accessToken: "token-123",
      } as any);

      const result = await completeCompanyProfile({
        street: "Rua",
        number: "123",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "SP",
        zipCode: "12345678",
      });
      expect(result).toEqual({ ok: false, error: "Empresa não encontrada" });
    });

    it("should complete profile successfully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "addr-1" }),
      });

      const result = await completeCompanyProfile({
        street: "Rua",
        number: "123",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "SP",
        zipCode: "12345678",
      });

      expect(result).toEqual({ ok: true });
    });
  });

  describe("getCompanyPayments", () => {
    it("should return empty array when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getCompanyPayments("company-1");
      expect(result).toEqual([]);
    });

    it("should return payments", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: "payment-1", amount: 100, status: "PAGO" },
        ],
      });

      const result = await getCompanyPayments("company-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getPaymentStats", () => {
    it("should return null when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getPaymentStats("company-1");
      expect(result).toBeNull();
    });

    it("should return stats", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 1000, paid: 500, pending: 500 }),
      });

      const result = await getPaymentStats("company-1");
      expect(result).not.toBeNull();
      expect(result!.total).toBe(1000);
    });
  });

  describe("createPayment", () => {
    it("should return error when not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      const result = await createPayment({
        companyId: "company-1",
        amount: 100,
        dueDate: "2024-01-15",
      });

      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should create payment successfully", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "payment-1" }),
      });

      const result = await createPayment({
        companyId: "company-1",
        amount: 100,
        dueDate: "2024-01-15",
      });

      expect(result).toEqual({ ok: true });
    });
  });

  describe("markPaymentAsPaid", () => {
    it("should return error when not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      const result = await markPaymentAsPaid("payment-1", "company-1");
      expect(result).toEqual({ ok: false, error: "Sem permissão" });
    });

    it("should mark payment as paid and send email", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              user: {
                email: "empresa@test.com",
                name: "Empresa Teste",
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      const result = await markPaymentAsPaid("payment-1", "company-1");
      expect(result).toEqual({ ok: true });
      expect(sendAccountActivatedEmail).toHaveBeenCalledWith(
        "empresa@test.com",
        "Empresa Teste"
      );
    });
  });
});
