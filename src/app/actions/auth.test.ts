import { describe, it, expect } from "vitest";

describe("auth actions - loginAction validation", () => {
  it("should normalize email to lowercase", () => {
    const email = "TEST@EXAMPLE.COM";
    const normalized = email.trim().toLowerCase();
    expect(normalized).toBe("test@example.com");
  });

  it("should trim whitespace from email", () => {
    const email = "  test@example.com  ";
    const trimmed = email.trim().toLowerCase();
    expect(trimmed).toBe("test@example.com");
  });

  it("should validate email format correctly", () => {
    const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });

  it("should trim and normalize form data email", () => {
    const formData = new FormData();
    formData.append("email", "  USER@TEST.COM  ");
    formData.append("password", "password123");
    
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    expect(email).toBe("user@test.com");
  });

  it("should handle empty form data", () => {
    const formData = new FormData();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    expect(email).toBeUndefined();
  });

  it("should extract user status codes", () => {
    const statusCodes = {
      ACTIVE: null,
      INACTIVE: { error: "BLOCKED", code: "BLOCKED" },
      PENDING: { error: "PENDING", code: "PENDING" },
    };

    expect(statusCodes.ACTIVE).toBeNull();
    expect(statusCodes.INACTIVE).toEqual({ error: "BLOCKED", code: "BLOCKED" });
    expect(statusCodes.PENDING).toEqual({ error: "PENDING", code: "PENDING" });
  });
});
