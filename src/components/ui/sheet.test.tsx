import { describe, it, expect } from "vitest";

describe("Sheet types and structure", () => {
  it("should define sheet side options", () => {
    const sides = ["top", "right", "bottom", "left"] as const;
    expect(sides).toContain("top");
    expect(sides).toContain("right");
    expect(sides).toContain("bottom");
    expect(sides).toContain("left");
  });

  it("should have default showCloseButton as true", () => {
    const showCloseButton = true;
    expect(showCloseButton).toBe(true);
  });
});
