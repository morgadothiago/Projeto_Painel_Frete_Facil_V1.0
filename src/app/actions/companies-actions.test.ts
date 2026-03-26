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

// Mock do axios
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: () => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
    }),
  },
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

    it("should return companies when authenticated as ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: "company-1",
              cnpj: "12.345.678/0001-99",
              tradeName: "Empresa Teste",
              user: {
                id: "user-1",
                name: "João",
                email: "joao@test.com",
                phone: "11999999999",
                status: "ACTIVE",
                createdAt: "2025-01-01",
              },
            },
          ],
        },
      });

      const result = await getCompanies();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("João");
      expect(result[0].status).toBe("ACTIVE");
    });

    it("should return empty array on API error", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockGet.mockRejectedValueOnce(new Error("Network error"));

      const result = await getCompanies();
      expect(result).toEqual([]);
    });
  });

  describe("updateCompanyStatus", () => {
    it("should return error when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await updateCompanyStatus("company-1", "ACTIVE");
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Sem permissão");
    });

    it("should update status and send email when activating", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      // Mock get company data
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            user: { email: "empresa@test.com", name: "Empresa" },
            tradeName: "Empresa LTDA",
          },
        },
      });

      // Mock update status
      mockPatch.mockResolvedValueOnce({});

      const result = await updateCompanyStatus("company-1", "ACTIVE");

      expect(result.ok).toBe(true);
      expect(sendAccountActivatedEmail).toHaveBeenCalledWith("empresa@test.com", "Empresa");
    });

    it("should send blocked email when inactivating", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            user: { email: "empresa@test.com", name: "Empresa" },
          },
        },
      });

      mockPatch.mockResolvedValueOnce({});

      await updateCompanyStatus("company-1", "INACTIVE");

      expect(sendAccountBlockedEmail).toHaveBeenCalledWith("empresa@test.com", "Empresa");
    });
  });

  describe("createCompanyAction", () => {
    it("should create company when authenticated as ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockPost.mockResolvedValueOnce({});

      const result = await createCompanyAction({
        name: "João",
        email: "joao@test.com",
        password: "123456",
        tradeName: "Empresa",
        cnpj: "12.345.678/0001-99",
      });

      expect(result.ok).toBe(true);
    });

    it("should return error on API failure", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockPost.mockRejectedValueOnce({
        response: { data: { message: "CNPJ já cadastrado" } },
      });

      const result = await createCompanyAction({
        name: "João",
        email: "joao@test.com",
        password: "123456",
        tradeName: "Empresa",
        cnpj: "12.345.678/0001-99",
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe("CNPJ já cadastrado");
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
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: { id: "company-1", cnpj: "12.345.678/0001-99" },
      });

      const result = await getCompanyDetails("company-1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("company-1");
    });

    it("should use /me endpoint for COMPANY role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: { id: "company-1" },
      });

      await getCompanyDetails("company-1");

      expect(mockGet).toHaveBeenCalledWith("/api/companies/me");
    });
  });

  describe("isCompanyProfileComplete", () => {
    it("should return true when not COMPANY", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      const result = await isCompanyProfileComplete();
      expect(result).toBe(true);
    });

    it("should return true when company has addresses", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: { addresses: [{ id: "addr-1" }] },
      });

      const result = await isCompanyProfileComplete();
      expect(result).toBe(true);
    });

    it("should return false when company has no addresses", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: { addresses: [] },
      });

      const result = await isCompanyProfileComplete();
      expect(result).toBe(false);
    });
  });

  describe("completeCompanyProfile", () => {
    it("should add address for COMPANY", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockPost.mockResolvedValueOnce({});

      const result = await completeCompanyProfile({
        street: "Rua A",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000",
      });

      expect(result.ok).toBe(true);
    });
  });

  describe("getCompanyPayments", () => {
    it("should return payments for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: [
          { id: "pay-1", amount: 100, status: "PENDENTE" },
          { id: "pay-2", amount: 200, status: "PAGO" },
        ],
      });

      const result = await getCompanyPayments("company-1");

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(100);
    });

    it("should return empty array when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getCompanyPayments("company-1");
      expect(result).toEqual([]);
    });
  });

  describe("getPaymentStats", () => {
    it("should return stats for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1" },
        accessToken: "token-123",
      } as any);

      mockGet.mockResolvedValueOnce({
        data: { total: 500, paid: 300, pending: 200, overdue: 0, count: 3 },
      });

      const result = await getPaymentStats("company-1");

      expect(result?.total).toBe(500);
      expect(result?.paid).toBe(300);
    });

    it("should return null when not authenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getPaymentStats("company-1");
      expect(result).toBeNull();
    });
  });

  describe("createPayment", () => {
    it("should create payment when ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      mockPost.mockResolvedValueOnce({});

      const result = await createPayment({
        companyId: "company-1",
        amount: 150,
        dueDate: "2026-04-25",
      });

      expect(result.ok).toBe(true);
    });

    it("should return error when not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      const result = await createPayment({
        companyId: "company-1",
        amount: 150,
        dueDate: "2026-04-25",
      });

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Sem permissão");
    });
  });

  describe("markPaymentAsPaid", () => {
    it("should mark payment as paid when ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);

      // Mock get company
      mockGet.mockResolvedValueOnce({
        data: {
          data: {
            user: { email: "empresa@test.com", name: "Empresa" },
          },
        },
      });

      // Mock patch payment status
      mockPatch.mockResolvedValueOnce({});

      // Mock patch company status
      mockPatch.mockResolvedValueOnce({});

      const result = await markPaymentAsPaid("pay-1", "company-1");

      expect(result.ok).toBe(true);
    });

    it("should return error when not ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "COMPANY" },
        accessToken: "token-123",
      } as any);

      const result = await markPaymentAsPaid("pay-1", "company-1");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Sem permissão");
    });
  });
});
