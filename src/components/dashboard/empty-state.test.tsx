import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Package } from "lucide-react";

describe("EmptyState Component", () => {
  const defaultProps = {
    icon: <Package data-testid="empty-icon" />,
    title: "No deliveries yet",
    subtitle: "Create your first delivery to get started",
    actionLabel: "Create Delivery",
    actionHref: "/dashboard/fretes/new",
  };

  it("renders all props correctly", () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    expect(screen.getByText("No deliveries yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first delivery to get started")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create delivery/i })).toHaveAttribute("href", "/dashboard/fretes/new");
  });

  it("link contains plus icon and label", () => {
    render(<EmptyState {...defaultProps} />);
    const link = screen.getByRole("link", { name: /create delivery/i });
    expect(link).toHaveTextContent("Create Delivery");
  });

  it("renders with different content", () => {
    render(
      <EmptyState 
        icon={<Package />}
        title="No vehicles"
        subtitle="Add vehicles to your fleet"
        actionLabel="Add Vehicle"
        actionHref="/dashboard/veiculos/new"
      />
    );
    
    expect(screen.getByText("No vehicles")).toBeInTheDocument();
    expect(screen.getByText("Add vehicles to your fleet")).toBeInTheDocument();
  });
});
