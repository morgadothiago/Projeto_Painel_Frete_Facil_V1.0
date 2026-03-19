import { describe, it, expect, vi, afterEach } from "vitest";

describe("authService - loginRequest with mock", () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_MOCK;

  afterEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalEnv;
  });

  it("should use mock when NEXT_PUBLIC_USE_MOCK=true", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    
    const { loginRequest } = await import("@/services/authService");
    const result = await loginRequest("admin@fretefacil.com", "password123");
    
    expect(result).not.toBeNull();
    expect(result?.user.role).toBe("ADMIN");
  });

  it("should return null for invalid credentials with mock", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    
    const { loginRequest } = await import("@/services/authService");
    const result = await loginRequest("invalid@email.com", "password");
    
    expect(result).toBeNull();
  });

  it("should return null for short password with mock", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    
    const { loginRequest } = await import("@/services/authService");
    const result = await loginRequest("admin@fretefacil.com", "ab");
    
    expect(result).toBeNull();
  });
});
