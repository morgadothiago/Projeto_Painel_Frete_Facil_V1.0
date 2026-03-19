import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar Component", () => {
  it("renders with default size", () => {
    render(<Avatar data-testid="avatar" />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("renders with sm size", () => {
    render(<Avatar data-testid="avatar" size="sm" />);
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "sm");
  });

  it("renders with lg size", () => {
    render(<Avatar data-testid="avatar" size="lg" />);
    expect(screen.getByTestId("avatar")).toHaveAttribute("data-size", "lg");
  });

  it("renders with custom className", () => {
    render(<Avatar data-testid="avatar" className="custom-class" />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });
});
