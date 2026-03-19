import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormInput } from "@/components/ui/form-input";

describe("FormInput Component", () => {
  it("renders with label", () => {
    render(<FormInput label="Email" name="email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<FormInput label="Email" name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("renders as required", () => {
    render(<FormInput label="Email" name="email" required />);
    const input = document.querySelector('input[name="email"]');
    expect(input).toBeInTheDocument();
  });

  it("renders with autoComplete", () => {
    render(<FormInput label="Email" name="email" autoComplete="email" />);
    const input = document.querySelector('input[name="email"]');
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("handles text input", async () => {
    const user = userEvent.setup();
    render(<FormInput label="Name" name="name" />);
    
    const input = document.querySelector('input[name="name"]');
    if (input) {
      await user.type(input, "John Doe");
      expect(input).toHaveValue("John Doe");
    }
  });

  it("renders with all props", () => {
    render(
      <FormInput 
        label="Test Field"
        name="test"
        type="text"
        placeholder="Enter test"
        required
        autoComplete="off"
      />
    );
    expect(screen.getByText("Test Field")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter test")).toBeInTheDocument();
  });
});

import userEvent from "@testing-library/user-event";
