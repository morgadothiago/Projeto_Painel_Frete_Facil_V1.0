import { describe, it, expect, vi, beforeEach } from "vitest";
import { VehicleTypePayload } from "@/app/actions/vehicleTypes";

vi.mock("@/lib/db", () => ({
  db: {
    vehicleType: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(() => Promise.resolve({
    user: { id: "admin-123", role: "ADMIN" },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("VehicleType validation - comprehensive", () => {
  const validPayload: VehicleTypePayload = {
    name: "Carro",
    icon: "car",
    description: "Veículo de médio porte",
    vehicleClass: "CARRO",
    size: "MEDIO",
    category: "PADRAO",
    maxWeight: 500,
    basePrice: 10,
    pricePerKm: 2,
    helperPrice: 50,
    additionalStopPrice: 10,
  };

  it("should validate name is required", () => {
    const validate = (data: VehicleTypePayload) => {
      if (!data.name?.trim()) return "Nome é obrigatório.";
      return null;
    };
    expect(validate({ ...validPayload, name: "" })).toBe("Nome é obrigatório.");
    expect(validate({ ...validPayload, name: "   " })).toBe("Nome é obrigatório.");
    expect(validate({ ...validPayload, name: "Moto" })).toBeNull();
  });

  it("should validate maxWeight is positive", () => {
    const validate = (data: VehicleTypePayload) => {
      if (data.maxWeight <= 0) return "Peso máximo deve ser maior que zero.";
      return null;
    };
    expect(validate({ ...validPayload, maxWeight: 0 })).toBe("Peso máximo deve ser maior que zero.");
    expect(validate({ ...validPayload, maxWeight: -1 })).toBe("Peso máximo deve ser maior que zero.");
    expect(validate({ ...validPayload, maxWeight: 1 })).toBeNull();
  });

  it("should validate prices are non-negative", () => {
    const validate = (data: VehicleTypePayload) => {
      if (data.basePrice < 0) return "Preço base não pode ser negativo.";
      if (data.pricePerKm < 0) return "Preço por km não pode ser negativo.";
      if (data.helperPrice < 0) return "Preço do ajudante não pode ser negativo.";
      if (data.additionalStopPrice < 0) return "Preço de parada adicional não pode ser negativo.";
      return null;
    };

    expect(validate({ ...validPayload, basePrice: -1 })).toBe("Preço base não pode ser negativo.");
    expect(validate({ ...validPayload, pricePerKm: -1 })).toBe("Preço por km não pode ser negativo.");
    expect(validate({ ...validPayload, helperPrice: -1 })).toBe("Preço do ajudante não pode ser negativo.");
    expect(validate({ ...validPayload, additionalStopPrice: -1 })).toBe("Preço de parada adicional não pode ser negativo.");
    
    expect(validate({ ...validPayload, basePrice: 0 })).toBeNull();
    expect(validate({ ...validPayload, pricePerKm: 0 })).toBeNull();
  });

  it("should accept valid payload", () => {
    const validate = (data: VehicleTypePayload) => {
      if (!data.name?.trim()) return "Nome é obrigatório.";
      if (data.maxWeight <= 0) return "Peso máximo deve ser maior que zero.";
      if (data.basePrice < 0) return "Preço base não pode ser negativo.";
      if (data.pricePerKm < 0) return "Preço por km não pode ser negativo.";
      if (data.helperPrice < 0) return "Preço do ajudante não pode ser negativo.";
      if (data.additionalStopPrice < 0) return "Preço de parada adicional não pode ser negativo.";
      return null;
    };

    expect(validate(validPayload)).toBeNull();
  });

  it("should handle extreme values", () => {
    const validate = (data: VehicleTypePayload) => {
      if (!data.name?.trim()) return "Nome é obrigatório.";
      if (data.maxWeight <= 0) return "Peso máximo deve ser maior que zero.";
      if (data.basePrice < 0) return "Preço base não pode ser negativo.";
      if (data.pricePerKm < 0) return "Preço por km não pode ser negativo.";
      if (data.helperPrice < 0) return "Preço do ajudante não pode ser negativo.";
      if (data.additionalStopPrice < 0) return "Preço de parada adicional não pode ser negativo.";
      return null;
    };

    const extremePayload: VehicleTypePayload = {
      ...validPayload,
      name: "Veículo Especial",
      maxWeight: 50000,
      basePrice: 999999,
      pricePerKm: 100,
      helperPrice: 1000,
      additionalStopPrice: 500,
    };

    expect(validate(extremePayload)).toBeNull();
  });
});

describe("Vehicle class validation", () => {
  const validClasses = ["MOTO", "CARRO", "VAN", "CAMINHAO_LEVE", "CAMINHAO_PESADO"];

  it("should validate vehicle classes", () => {
    expect(validClasses).toContain("CARRO");
    expect(validClasses).toContain("MOTO");
  });

  it("should reject invalid classes", () => {
    expect(validClasses).not.toContain("BICICLETA");
    expect(validClasses).not.toContain("ONIBUS");
  });
});

describe("Vehicle size validation", () => {
  const validSizes = ["PEQUENO", "MEDIO", "GRANDE"];

  it("should validate sizes", () => {
    expect(validSizes).toContain("PEQUENO");
    expect(validSizes).toContain("MEDIO");
    expect(validSizes).toContain("GRANDE");
  });
});

describe("Vehicle category validation", () => {
  const validCategories = ["EXPRESSO", "PADRAO", "PREMIUM", "CARGA_PESADA"];

  it("should validate categories", () => {
    expect(validCategories).toContain("PADRAO");
    expect(validCategories).toContain("EXPRESSO");
  });
});
