import { describe, it, expect } from "vitest";
import { rateLimit, isValidEmail, escapeHtml } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("should allow first request", () => {
    const result = rateLimit("test:user1", 5, 60000);
    expect(result).toBe(true);
  });

  it("should allow requests within limit", () => {
    const key = "test:user2";
    for (let i = 0; i < 4; i++) {
      rateLimit(key, 5, 60000);
    }
    expect(rateLimit(key, 5, 60000)).toBe(true);
  });

  it("should block requests exceeding limit", () => {
    const key = "test:user3";
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60000);
    }
    expect(rateLimit(key, 5, 60000)).toBe(false);
  });

  it("should reset after window expires", () => {
    const key = "test:user4";
    rateLimit(key, 1, 10);
    setTimeout(() => {
      expect(rateLimit(key, 1, 10)).toBe(true);
    }, 20);
  });
});

describe("isValidEmail", () => {
  it("should return true for valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.user@domain.org")).toBe(true);
    expect(isValidEmail("name+tag@company.co")).toBe(true);
  });

  it("should return false for invalid emails", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("user name@domain.com")).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("should escape HTML special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml('"double quotes"')).toBe("&quot;double quotes&quot;");
    expect(escapeHtml("'single quotes'")).toBe("&#39;single quotes&#39;");
  });

  it("should handle empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("should handle strings without special characters", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
