import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/dashboard/card";
import { Package } from "lucide-react";

describe("Card Component", () => {
  it("renders children correctly", () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with title", () => {
    render(<Card title="Test Title"><p>Content</p></Card>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <Card title="With Icon" icon={<Package data-testid="test-icon" />}>
        <p>Content</p>
      </Card>
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders with href link", () => {
    render(
      <Card title="With Link" href="/test" hrefLabel="View all">
        <p>Content</p>
      </Card>
    );
    const link = screen.getByRole("link", { name: /view all/i });
    expect(link).toHaveAttribute("href", "/test");
  });

  it("does not render link when href is not provided", () => {
    render(<Card title="No Link">Content</Card>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders with default hrefLabel", () => {
    render(
      <Card title="Default Label" href="/test">
        Content
      </Card>
    );
    expect(screen.getByText("Ver todos")).toBeInTheDocument();
  });

  it("renders without title", () => {
    render(<Card><p>No Title</p></Card>);
    expect(screen.queryByText("No Title")).toBeInTheDocument();
  });
});
