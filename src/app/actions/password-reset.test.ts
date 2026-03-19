import { describe, it, expect } from "vitest";

describe("Password Reset Logic", () => {
  it("should generate valid reset code", () => {
    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = generateCode();
    
    expect(code.length).toBe(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it("should validate code expiration", () => {
    const isExpired = (expiresAt: Date) => new Date() > expiresAt;
    
    expect(isExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isExpired(new Date(Date.now() + 1000))).toBe(false);
  });

  it("should validate code is not used", () => {
    const isValidCode = (used: boolean) => !used;
    
    expect(isValidCode(false)).toBe(true);
    expect(isValidCode(true)).toBe(false);
  });
});

describe("Email validation for password reset", () => {
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  it("should validate email format", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
  });

  it("should reject invalid email format", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });
});

describe("Password reset token structure", () => {
  it("should have correct token structure", () => {
    const createToken = (email: string) => ({
      email,
      code: Math.random().toString(36).substring(2, 8),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
      createdAt: new Date(),
    });

    const token = createToken("test@example.com");
    
    expect(token.email).toBe("test@example.com");
    expect(token.code.length).toBe(6);
    expect(token.used).toBe(false);
    expect(token.expiresAt > new Date()).toBe(true);
  });
});
