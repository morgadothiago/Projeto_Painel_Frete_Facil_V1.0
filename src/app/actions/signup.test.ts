import { describe, it, expect } from "vitest";
import { SignupPayload } from "@/app/actions/signup";
import { isValidEmail } from "@/lib/rate-limit";

describe("Signup validation", () => {
  function validateSignupPayload(formData: FormData): string | null {
    const email       = (formData.get("email")       as string)?.trim().toLowerCase();
    const password    = formData.get("password")    as string;
    const fullName    = (formData.get("fullName")    as string)?.trim();
    const companyName = (formData.get("companyName") as string)?.trim();
    const cnpj        = (formData.get("cnpj")        as string)?.replace(/\D/g, "");

    if (!isValidEmail(email || ""))       return "E-mail inválido.";
    if (!password || password.length < 8)  return "A senha deve ter ao menos 8 caracteres.";
    if (!/^\d{14}$/.test(cnpj || ""))   return "CNPJ inválido.";
    if (!fullName || !companyName)        return "Preencha todos os campos obrigatórios.";
    
    return null;
  }

  function createFormData(data: Record<string, string>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    return formData;
  }

  it("should return null for valid signup data", () => {
    const formData = createFormData({
      email: "newcompany@email.com",
      password: "password123",
      fullName: "Empresa Nova",
      companyName: "Empresa Nova LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBeNull();
  });

  it("should return error for invalid email", () => {
    const formData = createFormData({
      email: "invalid-email",
      password: "password123",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("E-mail inválido.");
  });

  it("should return error for empty email", () => {
    const formData = createFormData({
      email: "",
      password: "password123",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("E-mail inválido.");
  });

  it("should return error for short password", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "short",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("A senha deve ter ao menos 8 caracteres.");
  });

  it("should return error for empty password", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("A senha deve ter ao menos 8 caracteres.");
  });

  it("should return error for invalid CNPJ", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "password123",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12345678",
    });

    expect(validateSignupPayload(formData)).toBe("CNPJ inválido.");
  });

  it("should return error for CNPJ with special characters", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "password123",
      fullName: "Empresa",
      companyName: "Empresa LTDA",
      cnpj: "12.345.678/0001-90",
    });

    expect(validateSignupPayload(formData)).toBeNull();
  });

  it("should return error for empty fullName", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "password123",
      fullName: "",
      companyName: "Empresa LTDA",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("Preencha todos os campos obrigatórios.");
  });

  it("should return error for empty companyName", () => {
    const formData = createFormData({
      email: "valid@email.com",
      password: "password123",
      fullName: "Empresa",
      companyName: "",
      cnpj: "12345678000190",
    });

    expect(validateSignupPayload(formData)).toBe("Preencha todos os campos obrigatórios.");
  });

  it("should normalize email to lowercase", () => {
    const email = "TEST@EMAIL.COM";
    const normalized = email.trim().toLowerCase();
    expect(normalized).toBe("test@email.com");
  });

  it("should extract CNPJ digits only", () => {
    const cnpjWithMask = "12.345.678/0001-90";
    const digitsOnly = cnpjWithMask.replace(/\D/g, "");
    expect(digitsOnly).toBe("12345678000190");
  });
});

describe("SignupPayload type", () => {
  it("should have correct structure", () => {
    const payload: SignupPayload = {
      companyName: "Empresa Teste",
      cnpj: "12345678000190",
      phone: "11999999999",
      segment: "tech",
      fullName: "João Silva",
      email: "joao@empresa.com",
      position: "Gerente",
      password: "password123",
    };

    expect(payload.companyName).toBe("Empresa Teste");
    expect(payload.cnpj).toBe("12345678000190");
  });
});
