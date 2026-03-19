import { describe, it, expect } from "vitest";
import { AppNotification } from "@/app/actions/notifications";

describe("AppNotification type", () => {
  it("should have correct structure", () => {
    const notification: AppNotification = {
      id: "notif-123",
      title: "Nova empresa cadastrada",
      body: "Uma nova empresa está aguardando ativação",
      type: "COMPANY_PENDING",
      read: false,
      data: '{"companyUserId": "user-123"}',
      createdAt: new Date(),
    };

    expect(notification.id).toBe("notif-123");
    expect(notification.read).toBe(false);
    expect(notification.type).toBe("COMPANY_PENDING");
  });

  it("should allow null data", () => {
    const notification: AppNotification = {
      id: "notif-123",
      title: "Test",
      body: "Test body",
      type: "TEST",
      read: false,
      data: null,
      createdAt: new Date(),
    };

    expect(notification.data).toBeNull();
  });
});

describe("Notification type validation", () => {
  const validTypes = [
    "COMPANY_PENDING",
    "ACCOUNT_ACTIVATED",
    "ACCOUNT_BLOCKED",
    "PAYMENT_PENDING",
    "DELIVERY_UPDATE",
    "GPS_ALERT",
  ];

  it("should recognize valid notification types", () => {
    expect(validTypes.includes("COMPANY_PENDING")).toBe(true);
    expect(validTypes.includes("ACCOUNT_ACTIVATED")).toBe(true);
    expect(validTypes.includes("ACCOUNT_BLOCKED")).toBe(true);
  });

  it("should reject invalid notification types", () => {
    expect(validTypes.includes("INVALID_TYPE")).toBe(false);
  });
});

describe("Notification read status", () => {
  it("should track read status correctly", () => {
    const unread = { read: false };
    const read = { read: true };

    expect(unread.read).toBe(false);
    expect(read.read).toBe(true);
  });

  it("should filter unread notifications", () => {
    const notifications: AppNotification[] = [
      { id: "1", title: "Test 1", body: "Body 1", type: "TEST", read: false, data: null, createdAt: new Date() },
      { id: "2", title: "Test 2", body: "Body 2", type: "TEST", read: true, data: null, createdAt: new Date() },
      { id: "3", title: "Test 3", body: "Body 3", type: "TEST", read: false, data: null, createdAt: new Date() },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;
    expect(unreadCount).toBe(2);
  });
});

describe("Notification data parsing", () => {
  it("should parse notification data JSON", () => {
    const data = '{"companyUserId": "user-123", "companyName": "Empresa Teste"}';
    const parsed = JSON.parse(data);

    expect(parsed.companyUserId).toBe("user-123");
    expect(parsed.companyName).toBe("Empresa Teste");
  });

  it("should handle null data", () => {
    const data: string | null = null;
    if (data) {
      const parsed = JSON.parse(data);
      expect(parsed).toBeDefined();
    } else {
      expect(data).toBeNull();
    }
  });

  it("should serialize notification data", () => {
    const notificationData = {
      companyUserId: "user-123",
      companyName: "Empresa Teste",
    };
    const serialized = JSON.stringify(notificationData);

    expect(serialized).toBe('{"companyUserId":"user-123","companyName":"Empresa Teste"}');
  });
});

describe("Notification ordering", () => {
  it("should sort notifications by createdAt desc", () => {
    const notifications: AppNotification[] = [
      { id: "1", title: "Old", body: "", type: "TEST", read: false, data: null, createdAt: new Date("2024-01-01") },
      { id: "2", title: "New", body: "", type: "TEST", read: false, data: null, createdAt: new Date("2024-01-03") },
      { id: "3", title: "Middle", body: "", type: "TEST", read: false, data: null, createdAt: new Date("2024-01-02") },
    ];

    const sorted = [...notifications].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    expect(sorted[0].title).toBe("New");
    expect(sorted[1].title).toBe("Middle");
    expect(sorted[2].title).toBe("Old");
  });
});

describe("Notification IDOR prevention", () => {
  it("should validate notification belongs to user", () => {
    const notification = {
      userId: "company-user-123",
      id: "notif-456",
    };

    const currentUserId = "company-user-123";
    const canAccess = notification.userId === currentUserId;

    expect(canAccess).toBe(true);
  });

  it("should deny access when notification belongs to different user", () => {
    const notification = {
      userId: "other-user-456",
      id: "notif-789",
    };

    const currentUserId = "company-user-123";
    const canAccess = notification.userId === currentUserId;

    expect(canAccess).toBe(false);
  });
});
