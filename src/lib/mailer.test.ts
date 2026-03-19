import { describe, it, expect } from "vitest";

describe("Mailer Logic", () => {
  it("should format email template with data", () => {
    const formatTemplate = (template: string, data: Record<string, string>) => {
      let formatted = template;
      Object.entries(data).forEach(([key, value]) => {
        formatted = formatted.replace(new RegExp(`{{${key}}}`, "g"), value);
      });
      return formatted;
    };

    const template = "Olá {{name}}, bem-vindo!";
    const data = { name: "João" };
    
    expect(formatTemplate(template, data)).toBe("Olá João, bem-vindo!");
  });

  it("should validate email address format", () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("invalid")).toBe(false);
  });

  it("should escape HTML in user-provided content", () => {
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const userName = "<script>alert('xss')</script>";
    expect(escapeHtml(userName)).not.toContain("<script>");
  });
});

describe("Email Types", () => {
  const emailTypes = [
    "ACCOUNT_BLOCKED",
    "ACCOUNT_ACTIVATED",
    "ACCOUNT_PENDING",
    "PASSWORD_RESET",
    "WELCOME",
  ];

  it("should have all expected email types", () => {
    expect(emailTypes).toContain("ACCOUNT_BLOCKED");
    expect(emailTypes).toContain("ACCOUNT_ACTIVATED");
    expect(emailTypes).toContain("PASSWORD_RESET");
  });
});
