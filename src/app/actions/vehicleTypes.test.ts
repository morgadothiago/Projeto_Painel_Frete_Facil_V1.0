import { describe, it, expect } from "vitest";
import { VehicleTypePayload } from "@/app/actions/vehicleTypes";

function validateVehiclePayload(data: VehicleTypePayload): string | null {
  if (!data.name?.trim())              return "Nome é obrigatório.";
  if (data.maxWeight <= 0)             return "Peso máximo deve ser maior que zero.";
  if (data.basePrice < 0)              return "Preço base não pode ser negativo.";
  if (data.pricePerKm < 0)             return "Preço por km não pode ser negativo.";
  if (data.helperPrice < 0)            return "Preço do ajudante não pode ser negativo.";
  if (data.additionalStopPrice < 0)    return "Preço de parada adicional não pode ser negativo.";
  return null;
}

describe("vehicleTypes validation", () => {
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

  it("should return null for valid payload", () => {
    const result = validateVehiclePayload(validPayload);
    expect(result).toBeNull();
  });

  it("should return error when name is empty", () => {
    const payload = { ...validPayload, name: "" };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Nome é obrigatório.");
  });

  it("should return error when name is only whitespace", () => {
    const payload = { ...validPayload, name: "   " };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Nome é obrigatório.");
  });

  it("should return error when maxWeight is zero", () => {
    const payload = { ...validPayload, maxWeight: 0 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Peso máximo deve ser maior que zero.");
  });

  it("should return error when maxWeight is negative", () => {
    const payload = { ...validPayload, maxWeight: -10 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Peso máximo deve ser maior que zero.");
  });

  it("should return error when basePrice is negative", () => {
    const payload = { ...validPayload, basePrice: -5 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Preço base não pode ser negativo.");
  });

  it("should allow basePrice of zero", () => {
    const payload = { ...validPayload, basePrice: 0 };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });

  it("should return error when pricePerKm is negative", () => {
    const payload = { ...validPayload, pricePerKm: -1 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Preço por km não pode ser negativo.");
  });

  it("should allow pricePerKm of zero", () => {
    const payload = { ...validPayload, pricePerKm: 0 };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });

  it("should return error when helperPrice is negative", () => {
    const payload = { ...validPayload, helperPrice: -10 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Preço do ajudante não pode ser negativo.");
  });

  it("should allow helperPrice of zero", () => {
    const payload = { ...validPayload, helperPrice: 0 };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });

  it("should return error when additionalStopPrice is negative", () => {
    const payload = { ...validPayload, additionalStopPrice: -5 };
    const result = validateVehiclePayload(payload);
    expect(result).toBe("Preço de parada adicional não pode ser negativo.");
  });

  it("should allow additionalStopPrice of zero", () => {
    const payload = { ...validPayload, additionalStopPrice: 0 };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });

  it("should accept valid payload with all minimum values", () => {
    const payload: VehicleTypePayload = {
      ...validPayload,
      name: "Moto",
      maxWeight: 1,
      basePrice: 0,
      pricePerKm: 0,
      helperPrice: 0,
      additionalStopPrice: 0,
    };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });

  it("should accept large values", () => {
    const payload: VehicleTypePayload = {
      ...validPayload,
      maxWeight: 10000,
      basePrice: 1000,
      pricePerKm: 100,
      helperPrice: 500,
      additionalStopPrice: 100,
    };
    const result = validateVehiclePayload(payload);
    expect(result).toBeNull();
  });
});
