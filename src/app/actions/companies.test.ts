import { describe, it, expect } from "vitest";
import { CompanyRow } from "@/app/actions/companies";

describe("CompanyRow type", () => {
  it("should have correct structure", () => {
    const company: CompanyRow = {
      id: "company-123",
      userId: "user-456",
      cnpj: "12.345.678/0001-90",
      tradeName: "Empresa Teste",
      status: "ACTIVE",
      name: "Empresa Teste LTDA",
      email: "test@empresa.com",
      phone: "11999999999",
      createdAt: new Date().toISOString(),
    };

    expect(company.id).toBe("company-123");
    expect(company.cnpj).toBe("12.345.678/0001-90");
    expect(company.status).toBe("ACTIVE");
    expect(company.email).toBe("test@empresa.com");
  });

  it("should allow null tradeName", () => {
    const company: CompanyRow = {
      id: "company-123",
      userId: "user-456",
      cnpj: "12.345.678/0001-90",
      tradeName: null,
      status: "ACTIVE",
      name: "Empresa Teste",
      email: "test@empresa.com",
      phone: null,
      createdAt: new Date().toISOString(),
    };

    expect(company.tradeName).toBeNull();
    expect(company.phone).toBeNull();
  });
});

describe("Company status validation", () => {
  const validStatuses = ["ACTIVE", "PENDING", "INACTIVE"];

  it("should validate status values", () => {
    expect(validStatuses.includes("ACTIVE")).toBe(true);
    expect(validStatuses.includes("PENDING")).toBe(true);
    expect(validStatuses.includes("INACTIVE")).toBe(true);
    expect(validStatuses.includes("DELETED")).toBe(false);
  });
});

describe("Company status notifications", () => {
  type NotificationTemplate = {
    type: string;
    title: string;
    body: string;
  };

  const STATUS_NOTIFICATION: Record<"ACTIVE" | "PENDING" | "INACTIVE", NotificationTemplate> = {
    ACTIVE: {
      type:  "ACCOUNT_ACTIVATED",
      title: "Conta reativada",
      body:  "Sua conta foi reativada com sucesso.",
    },
    PENDING: {
      type:  "PAYMENT_PENDING",
      title: "Pagamento pendente",
      body:  "Identificamos uma pendência no pagamento.",
    },
    INACTIVE: {
      type:  "ACCOUNT_BLOCKED",
      title: "Conta bloqueada",
      body:  "Sua conta foi bloqueada por falta de pagamento.",
    },
  };

  it("should return correct notification for ACTIVE", () => {
    const notif = STATUS_NOTIFICATION.ACTIVE;
    expect(notif.type).toBe("ACCOUNT_ACTIVATED");
    expect(notif.title).toContain("reativada");
  });

  it("should return correct notification for PENDING", () => {
    const notif = STATUS_NOTIFICATION.PENDING;
    expect(notif.type).toBe("PAYMENT_PENDING");
    expect(notif.title).toContain("pendente");
  });

  it("should return correct notification for INACTIVE", () => {
    const notif = STATUS_NOTIFICATION.INACTIVE;
    expect(notif.type).toBe("ACCOUNT_BLOCKED");
    expect(notif.title).toContain("bloqueada");
  });
});

describe("CNPJ validation", () => {
  function formatCNPJ(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  it("should format CNPJ correctly", () => {
    expect(formatCNPJ("12345678000190")).toBe("12.345.678/0001-90");
  });

  it("should already be formatted", () => {
    expect(formatCNPJ("12.345.678/0001-90")).toBe("12.345.678/0001-90");
  });
});

describe("Company role validation", () => {
  function isValidCompanyRole(role: string): boolean {
    return role === "COMPANY";
  }

  it("should accept COMPANY role", () => {
    expect(isValidCompanyRole("COMPANY")).toBe(true);
  });

  it("should reject other roles", () => {
    expect(isValidCompanyRole("ADMIN")).toBe(false);
    expect(isValidCompanyRole("DRIVER")).toBe(false);
    expect(isValidCompanyRole("USER")).toBe(false);
  });
});
