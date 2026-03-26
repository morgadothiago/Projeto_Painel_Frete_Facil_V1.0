import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Package } from "lucide-react";

describe("StatCard Component", () => {
  const defaultProps = {
    icon: <Package data-testid="stat-icon" />,
    label: "Total Deliveries",
    value: "1,234",
    sub: "+12%",
    accent: "#0C6B64",
  };

  it("renders all props correctly", () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
    expect(screen.getByText("Total Deliveries")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders label with correct font weight", () => {
    render(<StatCard {...defaultProps} label="test label" />);
    const label = screen.getByText("test label");
    expect(label).toHaveStyle({ fontWeight: "600" });
  });

  it("renders with zero value", () => {
    render(<StatCard {...defaultProps} value="0" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders with negative sub", () => {
    render(<StatCard {...defaultProps} sub="-5%" />);
    expect(screen.getByText("-5%")).toBeInTheDocument();
  });

  it("renders with different accents", () => {
    render(<StatCard {...defaultProps} accent="#FF0000" />);
    const subBadge = screen.getByText("+12%");
    expect(subBadge).toBeInTheDocument();
  });

  it("renders trend indicator when provided", () => {
    render(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 15, isPositive: true }} 
      />
    );
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("renders negative trend indicator", () => {
    render(
      <StatCard 
        {...defaultProps} 
        trend={{ value: 8, isPositive: false }} 
      />
    );
    expect(screen.getByText("8%")).toBeInTheDocument();
  });
});
