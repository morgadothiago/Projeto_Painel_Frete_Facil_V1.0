import { describe, it, expect } from "vitest";
import { mockLogin } from "@/services/mock/auth.mock";

describe("mockLogin", () => {
  it("should return user data for valid admin email", async () => {
    const result = await mockLogin("admin@fretefacil.com", "password123");
    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("admin@fretefacil.com");
    expect(result?.user.role).toBe("ADMIN");
  });

  it("should return user data for valid company email", async () => {
    const result = await mockLogin("empresa@fretefacil.com", "password123");
    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("empresa@fretefacil.com");
    expect(result?.user.role).toBe("COMPANY");
  });

  it("should return user data for valid driver email", async () => {
    const result = await mockLogin("motorista@fretefacil.com", "password123");
    expect(result).not.toBeNull();
    expect(result?.user.email).toBe("motorista@fretefacil.com");
    expect(result?.user.role).toBe("DRIVER");
  });

  it("should return null for invalid email", async () => {
    const result = await mockLogin("invalid@email.com", "password123");
    expect(result).toBeNull();
  });

  it("should return null for short password", async () => {
    const result = await mockLogin("admin@fretefacil.com", "ab");
    expect(result).toBeNull();
  });

  it("should return null for empty password", async () => {
    const result = await mockLogin("admin@fretefacil.com", "");
    expect(result).toBeNull();
  });

  it("should include access_token in response", async () => {
    const result = await mockLogin("admin@fretefacil.com", "password123");
    expect(result?.access_token).toBeDefined();
    expect(typeof result?.access_token).toBe("string");
  });
});
