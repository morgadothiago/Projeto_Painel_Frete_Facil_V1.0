import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoCard } from "@/components/dashboard/info-card";
import { Package } from "lucide-react";

describe("InfoCard Component", () => {
  const defaultProps = {
    icon: <Package data-testid="info-icon" />,
    title: "Quick Start",
    description: "Learn how to get started with our platform",
    linkLabel: "Learn more",
    linkHref: "/help/getting-started",
  };

  it("renders all props correctly", () => {
    render(<InfoCard {...defaultProps} />);
    
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.getByText("Learn how to get started with our platform")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute("href", "/help/getting-started");
  });

  it("link contains arrow", () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByText(/learn more/i)).toHaveTextContent("→");
  });

  it("renders with long description", () => {
    render(
      <InfoCard 
        {...defaultProps} 
        description="This is a very long description that explains more details about the feature and how to use it properly." 
      />
    );
    expect(screen.getByText(/very long description/i)).toBeInTheDocument();
  });
});
