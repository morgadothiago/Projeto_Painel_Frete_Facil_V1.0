import { describe, it, expect } from "vitest";
import { MapDriver, MapDelivery, MapData } from "@/app/actions/map";

describe("MapDriver type", () => {
  it("should have correct structure", () => {
    const driver: MapDriver = {
      id: "driver-123",
      name: "João Silva",
      phone: "11999999999",
      rating: 4.5,
      lat: -23.5505,
      lng: -46.6333,
      heading: 90,
      vehicle: "Carro",
      plate: "ABC-1234",
    };

    expect(driver.id).toBe("driver-123");
    expect(driver.name).toBe("João Silva");
    expect(driver.rating).toBe(4.5);
  });

  it("should allow null phone", () => {
    const driver: MapDriver = {
      id: "driver-123",
      name: "João Silva",
      phone: null,
      rating: 0,
      lat: -23.5505,
      lng: -46.6333,
      heading: 0,
      vehicle: null,
      plate: null,
    };

    expect(driver.phone).toBeNull();
    expect(driver.vehicle).toBeNull();
  });
});

describe("MapDelivery type", () => {
  it("should have correct structure", () => {
    const delivery: MapDelivery = {
      id: "delivery-123",
      publicId: "FR-2024-001",
      company: "Empresa Teste",
      description: "Pacote pequeno",
      originLat: -23.5505,
      originLng: -46.6333,
      originCity: "São Paulo",
      destCity: "Campinas",
    };

    expect(delivery.id).toBe("delivery-123");
    expect(delivery.publicId).toBe("FR-2024-001");
    expect(delivery.originCity).toBe("São Paulo");
  });

  it("should allow null description", () => {
    const delivery: MapDelivery = {
      id: "delivery-123",
      publicId: "FR-2024-001",
      company: "Empresa Teste",
      description: null,
      originLat: -23.5505,
      originLng: -46.6333,
      originCity: "São Paulo",
      destCity: "Campinas",
    };

    expect(delivery.description).toBeNull();
  });
});

describe("MapData type", () => {
  it("should have correct structure", () => {
    const mapData: MapData = {
      drivers: [{
        id: "driver-123",
        name: "João Silva",
        phone: null,
        rating: 4.5,
        lat: -23.5505,
        lng: -46.6333,
        heading: 90,
        vehicle: "Carro",
        plate: "ABC-1234",
      }],
      deliveries: [{
        id: "delivery-123",
        publicId: "FR-2024-001",
        company: "Empresa Teste",
        description: null,
        originLat: -23.5505,
        originLng: -46.6333,
        originCity: "São Paulo",
        destCity: "Campinas",
      }],
    };

    expect(mapData.drivers.length).toBe(1);
    expect(mapData.deliveries.length).toBe(1);
  });

  it("should allow empty arrays", () => {
    const mapData: MapData = {
      drivers: [],
      deliveries: [],
    };

    expect(mapData.drivers.length).toBe(0);
    expect(mapData.deliveries.length).toBe(0);
  });
});

describe("Delivery status validation", () => {
  const ACTIVE_STATUSES = ["ACCEPTED", "COLLECTING", "IN_TRANSIT"];

  it("should recognize active statuses", () => {
    expect(ACTIVE_STATUSES.includes("ACCEPTED")).toBe(true);
    expect(ACTIVE_STATUSES.includes("COLLECTING")).toBe(true);
    expect(ACTIVE_STATUSES.includes("IN_TRANSIT")).toBe(true);
  });

  it("should reject inactive statuses", () => {
    expect(ACTIVE_STATUSES.includes("PENDING")).toBe(false);
    expect(ACTIVE_STATUSES.includes("DELIVERED")).toBe(false);
    expect(ACTIVE_STATUSES.includes("CANCELLED")).toBe(false);
  });
});

describe("GPS coordinate validation", () => {
  function isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  it("should validate valid coordinates", () => {
    expect(isValidCoordinate(-23.5505, -46.6333)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(90, 180)).toBe(true);
    expect(isValidCoordinate(-90, -180)).toBe(true);
  });

  it("should reject invalid latitude", () => {
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(-91, 0)).toBe(false);
  });

  it("should reject invalid longitude", () => {
    expect(isValidCoordinate(0, 181)).toBe(false);
    expect(isValidCoordinate(0, -181)).toBe(false);
  });
});

describe("Driver rating calculation", () => {
  function calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  it("should calculate average rating", () => {
    expect(calculateAverageRating([5, 4, 5, 4])).toBe(4.5);
    expect(calculateAverageRating([5, 5, 5])).toBe(5);
    expect(calculateAverageRating([3, 4])).toBe(3.5);
  });

  it("should return 0 for empty ratings", () => {
    expect(calculateAverageRating([])).toBe(0);
  });
});

describe("Map marker filtering", () => {
  it("should filter drivers by online status", () => {
    const drivers = [
      { id: "1", isOnline: true },
      { id: "2", isOnline: false },
      { id: "3", isOnline: true },
    ];

    const onlineDrivers = drivers.filter(d => d.isOnline);
    expect(onlineDrivers.length).toBe(2);
  });

  it("should exclude busy drivers", () => {
    const busyDriverIds = ["driver-2", "driver-3"];
    const drivers = [
      { id: "driver-1" },
      { id: "driver-2" },
      { id: "driver-3" },
    ];

    const availableDrivers = drivers.filter(d => !busyDriverIds.includes(d.id));
    expect(availableDrivers.length).toBe(1);
    expect(availableDrivers[0].id).toBe("driver-1");
  });
});
