import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputField } from "@/components/ui/input-field";

describe("InputField Component", () => {
  it("renders with label", () => {
    render(<InputField label="Email" name="email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<InputField label="Email" name="email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("renders with required indicator", () => {
    render(<InputField label="Email" name="email" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders without required indicator when not required", () => {
    render(<InputField label="Email" name="email" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders with error message", () => {
    render(<InputField label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<InputField label="Email" name="email" helper="Enter a valid email address" />);
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
  });

  it("hides helper when error is present", () => {
    render(
      <InputField 
        label="Email" 
        name="email" 
        helper="Helper text"
        error="Error text"
      />
    );
    expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
  });

  it("handles text input", async () => {
    const user = userEvent.setup();
    render(<InputField label="Name" name="name" />);
    
    await user.type(screen.getByLabelText("Name"), "John Doe");
    expect(screen.getByLabelText("Name")).toHaveValue("John Doe");
  });

  it("renders with leftIcon", () => {
    render(<InputField label="Search" name="search" leftIcon={<span data-testid="icon">🔍</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders with rightElement", () => {
    render(<InputField label="Search" name="search" rightElement={<span data-testid="right">→</span>} />);
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("renders with different input types", () => {
    const { rerender } = render(<InputField label="Text" name="text" type="text" />);
    expect(screen.getByLabelText("Text")).toHaveAttribute("type", "text");

    rerender(<InputField label="Email" name="email" type="email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");

    rerender(<InputField label="Password" name="password" type="password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("renders with all props together", () => {
    render(
      <InputField 
        label="Test Field"
        name="test"
        placeholder="Enter test"
        required
        helper="Helper text"
        type="text"
        leftIcon={<span>🔍</span>}
      />
    );
    expect(screen.getByText("Test Field")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter test")).toBeInTheDocument();
    expect(screen.getByText("Helper text")).toBeInTheDocument();
  });
});
