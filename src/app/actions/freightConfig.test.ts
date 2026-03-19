import { describe, it, expect } from "vitest";
import { FreightConfigData } from "@/app/actions/freightConfig";

function validateFreightConfig(data: FreightConfigData): string | null {
  if (data.platformFeePct  < 0 || data.platformFeePct  > 100) return "Comissão da plataforma deve ser entre 0% e 100%.";
  if (data.insuranceFeePct < 0 || data.insuranceFeePct > 100) return "Taxa de seguro deve ser entre 0% e 100%.";
  if (data.nightSurcharge  < 0 || data.nightSurcharge  > 100) return "Adicional noturno deve ser entre 0% e 100%.";
  if (data.weekendSurcharge < 0 || data.weekendSurcharge > 100) return "Adicional de fim de semana deve ser entre 0% e 100%.";
  if (data.minimumPrice < 0)                                   return "Preço mínimo não pode ser negativo.";
  return null;
}

describe("freightConfig validation", () => {
  const validConfig: FreightConfigData = {
    platformFeePct: 15,
    insuranceFeePct: 5,
    minimumPrice: 10,
    tollReimburse: true,
    nightSurcharge: 10,
    weekendSurcharge: 20,
  };

  it("should return null for valid config", () => {
    const result = validateFreightConfig(validConfig);
    expect(result).toBeNull();
  });

  it("should validate platformFeePct boundary values", () => {
    expect(validateFreightConfig({ ...validConfig, platformFeePct: 0 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, platformFeePct: 100 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, platformFeePct: -1 })).toBe("Comissão da plataforma deve ser entre 0% e 100%.");
    expect(validateFreightConfig({ ...validConfig, platformFeePct: 101 })).toBe("Comissão da plataforma deve ser entre 0% e 100%.");
  });

  it("should validate insuranceFeePct boundary values", () => {
    expect(validateFreightConfig({ ...validConfig, insuranceFeePct: 0 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, insuranceFeePct: 100 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, insuranceFeePct: -1 })).toBe("Taxa de seguro deve ser entre 0% e 100%.");
    expect(validateFreightConfig({ ...validConfig, insuranceFeePct: 101 })).toBe("Taxa de seguro deve ser entre 0% e 100%.");
  });

  it("should validate nightSurcharge boundary values", () => {
    expect(validateFreightConfig({ ...validConfig, nightSurcharge: 0 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, nightSurcharge: 100 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, nightSurcharge: -1 })).toBe("Adicional noturno deve ser entre 0% e 100%.");
    expect(validateFreightConfig({ ...validConfig, nightSurcharge: 101 })).toBe("Adicional noturno deve ser entre 0% e 100%.");
  });

  it("should validate weekendSurcharge boundary values", () => {
    expect(validateFreightConfig({ ...validConfig, weekendSurcharge: 0 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, weekendSurcharge: 100 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, weekendSurcharge: -1 })).toBe("Adicional de fim de semana deve ser entre 0% e 100%.");
    expect(validateFreightConfig({ ...validConfig, weekendSurcharge: 101 })).toBe("Adicional de fim de semana deve ser entre 0% e 100%.");
  });

  it("should validate minimumPrice", () => {
    expect(validateFreightConfig({ ...validConfig, minimumPrice: 0 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, minimumPrice: 100 })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, minimumPrice: -1 })).toBe("Preço mínimo não pode ser negativo.");
  });

  it("should validate tollReimburse", () => {
    expect(validateFreightConfig({ ...validConfig, tollReimburse: true })).toBeNull();
    expect(validateFreightConfig({ ...validConfig, tollReimburse: false })).toBeNull();
  });

  it("should accept extreme but valid values", () => {
    const extremeConfig: FreightConfigData = {
      platformFeePct: 50,
      insuranceFeePct: 50,
      minimumPrice: 999,
      tollReimburse: true,
      nightSurcharge: 50,
      weekendSurcharge: 50,
    };
    expect(validateFreightConfig(extremeConfig)).toBeNull();
  });
});

describe("VehicleTypePricing validation", () => {
  type Pricing = {
    basePrice: number;
    pricePerKm: number;
    helperPrice: number;
    additionalStopPrice: number;
  };

  function validatePricing(pricing: Pricing): boolean {
    return pricing.basePrice >= 0 && pricing.pricePerKm >= 0 && pricing.helperPrice >= 0 && pricing.additionalStopPrice >= 0;
  }

  it("should accept valid pricing", () => {
    expect(validatePricing({ basePrice: 10, pricePerKm: 2, helperPrice: 50, additionalStopPrice: 10 })).toBe(true);
  });

  it("should accept zero values", () => {
    expect(validatePricing({ basePrice: 0, pricePerKm: 0, helperPrice: 0, additionalStopPrice: 0 })).toBe(true);
  });

  it("should reject negative basePrice", () => {
    expect(validatePricing({ basePrice: -1, pricePerKm: 2, helperPrice: 50, additionalStopPrice: 10 })).toBe(false);
  });

  it("should reject negative pricePerKm", () => {
    expect(validatePricing({ basePrice: 10, pricePerKm: -1, helperPrice: 50, additionalStopPrice: 10 })).toBe(false);
  });

  it("should reject negative helperPrice", () => {
    expect(validatePricing({ basePrice: 10, pricePerKm: 2, helperPrice: -1, additionalStopPrice: 10 })).toBe(false);
  });

  it("should reject negative additionalStopPrice", () => {
    expect(validatePricing({ basePrice: 10, pricePerKm: 2, helperPrice: 50, additionalStopPrice: -1 })).toBe(false);
  });
});
