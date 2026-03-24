import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { checkCompanyAccess, getPendingPayment } from "./billing";
import { auth } from "@/auth";

const mockAuth = vi.mocked(auth);

// Mock do fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("billing - Company Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3001";
  });

  describe("checkCompanyAccess", () => {
    it("should deny access when no session exists", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: false });
    });

    it("should allow access for users without company", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);
      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: true });
    });

    it("should deny access for INACTIVE company", async () => {
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
        json: async () => ({
          user: { status: "INACTIVE" },
        }),
      });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: false, reason: "INACTIVE" });
    });

    it("should deny access for PENDING company", async () => {
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
        json: async () => ({
          user: { status: "PENDING" },
        }),
      });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: false, reason: "PENDING" });
    });

    it("should allow access for ACTIVE company with no payment issues", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { status: "ACTIVE" },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ active: true }),
        });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: true });
    });

    it("should deny access for overdue payment", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { status: "ACTIVE" },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ active: false }),
        });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: false, reason: "OVERDUE" });
    });

    it("should allow access when company API fails", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: true });
    });

    it("should allow access when payment check API fails", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { status: "ACTIVE" },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: true });
    });

    it("should allow access when fetch throws error", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await checkCompanyAccess();
      expect(result).toEqual({ allowed: true });
    });
  });

  describe("getPendingPayment", () => {
    it("should return null when no session exists", async () => {
      mockAuth.mockResolvedValue(null as any);
      const result = await getPendingPayment();
      expect(result).toBeNull();
    });

    it("should return null when user has no company", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
        accessToken: "token-123",
      } as any);
      const result = await getPendingPayment();
      expect(result).toBeNull();
    });

    it("should return pending payment data", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      const paymentData = {
        id: "payment-1",
        amount: 100,
        dueDate: "2024-01-15",
        daysUntilDue: 5,
        description: "Mensalidade",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => paymentData,
      });

      const result = await getPendingPayment();
      expect(result).toEqual(paymentData);
    });

    it("should return null when API fails", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getPendingPayment();
      expect(result).toBeNull();
    });

    it("should return null when fetch throws error", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          role: "COMPANY",
          company: { id: "company-1" },
        },
        accessToken: "token-123",
      } as any);

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getPendingPayment();
      expect(result).toBeNull();
    });
  });
});
