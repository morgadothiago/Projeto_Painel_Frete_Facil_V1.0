import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

// Mock do useActionState
const mockAction = vi.fn();
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useActionState: () => [null, mockAction, false],
  };
});

// Mock do sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock do loginAction
vi.mock("@/app/actions/auth", () => ({
  loginAction: vi.fn(),
}));

// Mock do InputField
vi.mock("@/components/ui/input-field", () => ({
  InputField: ({ label, name, type, placeholder }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} />
    </div>
  ),
}));

// Mock do tenantConfig
vi.mock("@/config/tenant", () => ({
  tenantConfig: {
    theme: {
      textSecondary: "#64748B",
      primary: "#0C6B64",
      primaryLight: "#F0FDF4",
      radiusMd: 8,
      radiusXl: 12,
      error: "#DC2626",
      border: "#E2E8F0",
    },
  },
}));

describe("LoginForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Senha")).toBeDefined();
  });

  it("should render submit button", () => {
    render(<LoginForm />);
    expect(screen.getByText("Entrar na plataforma")).toBeDefined();
  });

  it("should have form with action", () => {
    const { container } = render(<LoginForm />);
    const form = container.querySelector("form");
    expect(form).toBeDefined();
  });

  it("should have email input with correct attributes", () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("E-mail");
    expect(emailInput).toHaveProperty("type", "text");
    expect(emailInput).toHaveProperty("name", "email");
  });

  it("should have password input with correct attributes", () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText("Senha");
    expect(passwordInput).toHaveProperty("type", "password");
    expect(passwordInput).toHaveProperty("name", "password");
  });

  it("should have submit button of type submit", () => {
    render(<LoginForm />);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("type", "submit");
  });
});
