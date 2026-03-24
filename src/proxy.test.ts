import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock do next-auth/jwt
vi.mock("next-auth/jwt", () => ({
  decode: vi.fn(),
}));

import proxy from "./proxy";
import { decode } from "next-auth/jwt";

const mockDecode = vi.mocked(decode);

function createRequest(pathname: string, cookie?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return new NextRequest(url, { headers });
}

describe("proxy - Security Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-secret";
  });

  describe("Public routes", () => {
    it("should allow access to login page without authentication", async () => {
      const req = createRequest("/");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should allow access to signup page without authentication", async () => {
      const req = createRequest("/signup");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should allow access to forgot-password page without authentication", async () => {
      const req = createRequest("/forgot-password");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should allow access to forgot-password subpages", async () => {
      const req = createRequest("/forgot-password/reset");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should allow access to signup subpages", async () => {
      const req = createRequest("/signup/step2");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });

  describe("NextAuth and static routes", () => {
    it("should bypass auth check for /api/auth routes", async () => {
      const req = createRequest("/api/auth/session");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should bypass auth check for /_next routes", async () => {
      const req = createRequest("/_next/static/chunk.js");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should bypass auth check for files with extensions", async () => {
      const req = createRequest("/favicon.ico");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });
  });

  describe("Dashboard protection", () => {
    it("should redirect unauthenticated users to login", async () => {
      mockDecode.mockResolvedValue(null);
      const req = createRequest("/dashboard");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/");
    });

    it("should delete corrupted cookie on redirect", async () => {
      mockDecode.mockRejectedValue(new Error("Invalid token"));
      const req = createRequest("/dashboard", "authjs.session-token=invalid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
    });

    it("should allow authenticated users with ACTIVE status", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "ACTIVE",
      });
      const req = createRequest("/dashboard", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should redirect users with PENDING status and delete cookie", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "PENDING",
      });
      const req = createRequest("/dashboard", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/");
    });

    it("should redirect users with INACTIVE status and delete cookie", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "INACTIVE",
      });
      const req = createRequest("/dashboard", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/");
    });
  });

  describe("Logged in user on public pages", () => {
    it("should redirect authenticated users from login to dashboard", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "ACTIVE",
      });
      const req = createRequest("/", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });

    it("should redirect authenticated users from signup to dashboard", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "ACTIVE",
      });
      const req = createRequest("/signup", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });
  });

  describe("Admin routes protection", () => {
    it("should allow ADMIN users to access admin routes", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      const req = createRequest("/dashboard/admin", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(200);
    });

    it("should redirect non-ADMIN users from admin routes to dashboard", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "COMPANY",
        status: "ACTIVE",
      });
      const req = createRequest("/dashboard/admin", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });

    it("should redirect DRIVER users from admin routes", async () => {
      mockDecode.mockResolvedValue({
        sub: "user-1",
        role: "DRIVER",
        status: "ACTIVE",
      });
      const req = createRequest("/dashboard/admin/settings", "authjs.session-token=valid");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/dashboard");
    });
  });

  describe("Token decoding errors", () => {
    it("should handle decode errors gracefully", async () => {
      mockDecode.mockRejectedValue(new Error("Decode failed"));
      const req = createRequest("/dashboard", "authjs.session-token=corrupted");
      const res = await proxy(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/");
    });

    it("should handle null token gracefully", async () => {
      mockDecode.mockResolvedValue(null);
      const req = createRequest("/dashboard");
      const res = await proxy(req);
      expect(res.status).toBe(307);
    });
  });

  describe("Cookie handling", () => {
    it("should use correct cookie salt in decode call", async () => {
      mockDecode.mockResolvedValue(null);
      const req = createRequest("/dashboard");
      await proxy(req);
      
      expect(mockDecode).toHaveBeenCalledWith(
        expect.objectContaining({
          secret: "test-secret",
        })
      );
    });
  });
});
