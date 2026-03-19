import { describe, it, expect } from "vitest";

describe("GPS location validation", () => {
  it("should validate latitude range", () => {
    const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
    
    expect(isValidLat(0)).toBe(true);
    expect(isValidLat(-90)).toBe(true);
    expect(isValidLat(90)).toBe(true);
    expect(isValidLat(-91)).toBe(false);
    expect(isValidLat(91)).toBe(false);
  });

  it("should validate longitude range", () => {
    const isValidLng = (lng: number) => lng >= -180 && lng <= 180;
    
    expect(isValidLng(0)).toBe(true);
    expect(isValidLng(-180)).toBe(true);
    expect(isValidLng(180)).toBe(true);
    expect(isValidLng(-181)).toBe(false);
    expect(isValidLng(181)).toBe(false);
  });

  it("should validate heading range (0-360)", () => {
    const isValidHeading = (heading: number) => heading >= 0 && heading <= 360;
    
    expect(isValidHeading(0)).toBe(true);
    expect(isValidHeading(180)).toBe(true);
    expect(isValidHeading(360)).toBe(true);
    expect(isValidHeading(-1)).toBe(false);
    expect(isValidHeading(361)).toBe(false);
  });

  it("should validate speed (non-negative)", () => {
    const isValidSpeed = (speed: number) => speed >= 0;
    
    expect(isValidSpeed(0)).toBe(true);
    expect(isValidSpeed(50)).toBe(true);
    expect(isValidSpeed(-1)).toBe(false);
  });

  it("should create GPS location object", () => {
    const createLocation = (
      driverId: string,
      lat: number,
      lng: number,
      heading?: number,
      speed?: number,
      deliveryId?: string
    ) => ({
      driverId,
      lat,
      lng,
      heading: heading ?? null,
      speed: speed ?? null,
      deliveryId: deliveryId ?? null,
    });

    const location = createLocation("driver123", -23.5505, -46.6333);
    expect(location).toEqual({
      driverId: "driver123",
      lat: -23.5505,
      lng: -46.6333,
      heading: null,
      speed: null,
      deliveryId: null,
    });

    const locationWithOptional = createLocation("driver123", -23.5505, -46.6333, 90, 30, "delivery456");
    expect(locationWithOptional).toEqual({
      driverId: "driver123",
      lat: -23.5505,
      lng: -46.6333,
      heading: 90,
      speed: 30,
      deliveryId: "delivery456",
    });
  });

  it("should validate driver owns delivery", () => {
    const canAccessDelivery = (deliveryDriverId: string | null, currentDriverId: string) => {
      return deliveryDriverId === currentDriverId;
    };

    expect(canAccessDelivery("driver123", "driver123")).toBe(true);
    expect(canAccessDelivery("other_driver", "driver123")).toBe(false);
    expect(canAccessDelivery(null, "driver123")).toBe(false);
  });
});
