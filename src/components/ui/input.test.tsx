import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
  it("renders with default props", () => {
    render(<Input />);
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter email" />);
    const input = document.querySelector('input[placeholder="Enter email"]');
    expect(input).toBeInTheDocument();
  });

  it("handles text input", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = document.querySelector('input');
    if (input) {
      await user.type(input, "test@example.com");
      expect(input).toHaveValue("test@example.com");
    }
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = document.querySelector('input[disabled]');
    expect(input).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<Input className="custom-class" />);
    const input = document.querySelector('input');
    expect(input).toBeInTheDocument();
  });
});

import userEvent from "@testing-library/user-event";
