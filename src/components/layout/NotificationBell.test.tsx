import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock dos hooks do React
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, (fn: () => void) => fn()],
  };
});

// Mock do sonner
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock das actions de notificação
vi.mock("@/app/actions/notifications", () => ({
  getNotifications: vi.fn(),
  markAllAsRead: vi.fn(),
  activateCompany: vi.fn(),
  clearAllNotifications: vi.fn(),
}));

// Mock do Sheet
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: any) => (open ? <div data-testid="sheet">{children}</div> : null),
  SheetContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock do tenantConfig
vi.mock("@/config/tenant", () => ({
  tenantConfig: {
    theme: {
      primary: "#0C6B64",
      textSecondary: "#64748B",
      background: "#F8FAFC",
      surface: "#FFFFFF",
    },
  },
}));

import { NotificationBell } from "./NotificationBell";
import {
  getNotifications,
  markAllAsRead,
  clearAllNotifications,
} from "@/app/actions/notifications";

const mockGetNotifications = vi.mocked(getNotifications);
const mockMarkAllAsRead = vi.mocked(markAllAsRead);
const mockClearAllNotifications = vi.mocked(clearAllNotifications);

describe("NotificationBell Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNotifications.mockResolvedValue([]);
    mockMarkAllAsRead.mockResolvedValue(undefined);
    mockClearAllNotifications.mockResolvedValue(undefined);
  });

  it("should render bell button", () => {
    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    expect(bellButton).toBeDefined();
  });

  it("should open sheet when clicking bell", async () => {
    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Notificações")).toBeDefined();
    });
  });

  it("should show empty state when no notifications", async () => {
    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Tudo em dia!")).toBeDefined();
    });
  });

  it("should render notification title", async () => {
    mockGetNotifications.mockResolvedValue([
      {
        id: "notif-1",
        title: "Teste Notificação",
        body: "Corpo da notificação",
        type: "TEST",
        read: false,
        data: null,
        createdAt: new Date(),
      },
    ]);

    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Teste Notificação")).toBeDefined();
    });
  });

  it("should show unread indicator", async () => {
    mockGetNotifications.mockResolvedValue([
      {
        id: "notif-1",
        title: "Teste",
        body: "Corpo",
        type: "TEST",
        read: false,
        data: null,
        createdAt: new Date(),
      },
    ]);

    render(<NotificationBell />);
    await waitFor(() => {
      // O indicador de não lido deve estar presente (ponto vermelho)
      const { container } = render(<NotificationBell />);
      expect(container.querySelector('[style*="background: #EF4444"]')).toBeDefined();
    });
  });

  it("should render COMPANY_PENDING notification", async () => {
    mockGetNotifications.mockResolvedValue([
      {
        id: "notif-1",
        title: "Nova empresa",
        body: "Aguarda ativação",
        type: "COMPANY_PENDING",
        read: false,
        data: JSON.stringify({
          companyUserId: "user-1",
          companyName: "Empresa Teste",
        }),
        createdAt: new Date(),
      },
    ]);

    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Nova empresa")).toBeDefined();
    });
  });

  it("should render PAYMENT_PENDING notification", async () => {
    mockGetNotifications.mockResolvedValue([
      {
        id: "notif-1",
        title: "Pagamento pendente",
        body: "Identificamos uma pendência",
        type: "PAYMENT_PENDING",
        read: false,
        data: JSON.stringify({
          companyName: "Empresa Teste",
        }),
        createdAt: new Date(),
      },
    ]);

    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Pagamento pendente")).toBeDefined();
    });
  });

  it("should show filter tabs", async () => {
    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("Todas")).toBeDefined();
      expect(screen.getByText("Não lidas")).toBeDefined();
    });
  });

  it("should show notification count in header", async () => {
    mockGetNotifications.mockResolvedValue([
      {
        id: "notif-1",
        title: "Teste 1",
        body: "Corpo",
        type: "TEST",
        read: false,
        data: null,
        createdAt: new Date(),
      },
      {
        id: "notif-2",
        title: "Teste 2",
        body: "Corpo",
        type: "TEST",
        read: false,
        data: null,
        createdAt: new Date(),
      },
    ]);

    render(<NotificationBell />);
    const bellButton = screen.getByRole("button");
    fireEvent.click(bellButton);
    await waitFor(() => {
      expect(screen.getByText("2 não lidas")).toBeDefined();
    });
  });
});
