import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/dashboard/page-header";

describe("PageHeader Component", () => {
  it("renders title correctly", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Dashboard" subtitle="Welcome back" />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<PageHeader title="Page" label="Section" />);
    expect(screen.getByText("Section")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<PageHeader title="Page Only" />);
    expect(screen.queryByText("Section")).not.toBeInTheDocument();
  });

  it("renders action button when actionLabel and actionHref provided", () => {
    render(
      <PageHeader 
        title="Page" 
        actionLabel="Create New" 
        actionHref="/create" 
      />
    );
    expect(screen.getByRole("link", { name: /create new/i })).toHaveAttribute("href", "/create");
  });

  it("does not render action button when only actionLabel provided", () => {
    render(<PageHeader title="Page" actionLabel="Create" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render action button when only actionHref provided", () => {
    render(<PageHeader title="Page" actionHref="/create" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("replaces Olá with time-based greeting", () => {
    render(<PageHeader title="Olá, Admin" />);
    const heading = screen.getByRole("heading");
    expect(heading).not.toHaveTextContent("Olá");
  });
});
