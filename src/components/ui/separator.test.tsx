import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator Component", () => {
  it("renders with default props", () => {
    render(<Separator data-testid="separator" />);
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<Separator data-testid="separator" className="custom-class" />);
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });
});
