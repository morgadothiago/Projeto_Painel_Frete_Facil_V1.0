import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { clsx } from "clsx";

describe("cn (classname merger)", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toContain("base");
    expect(result).toContain("active");
  });

  it("should handle undefined values", () => {
    const result = cn("foo", undefined, "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should merge tailwind classes correctly", () => {
    const result = cn("px-2 py-2", "px-4");
    expect(result).toContain("py-2");
  });
});
