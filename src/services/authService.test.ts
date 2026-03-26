import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock do módulo api
vi.mock("@/lib/api", () => ({
  publicApi: {
    post: vi.fn(),
  },
  getErrorMessage: vi.fn((err: unknown) => {
    if (err instanceof Error) return err.message
    return "Erro de conexão. Tente novamente."
  }),
}))

import { loginRequest } from "@/services/authService"
import { publicApi } from "@/lib/api"

const mockPost = vi.mocked(publicApi.post)

describe("authService - loginRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return LoginResponse on successful login", async () => {
    const mockResponse = {
      access_token: "jwt-token-123",
      user: {
        id: "1",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
        status: "ACTIVE",
      },
    }

    mockPost.mockResolvedValueOnce({ data: mockResponse } as any)

    const result = await loginRequest("admin@test.com", "password123")

    expect(result).toEqual(mockResponse)
    expect(mockPost).toHaveBeenCalledWith("/api/auth/login", {
      email: "admin@test.com",
      password: "password123",
    })
  })

  it("should return error when API returns 401", async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: "E-mail ou senha inválidos" },
      },
      message: "E-mail ou senha inválidos",
    })

    const result = await loginRequest("wrong@test.com", "wrongpass")

    expect(result).toHaveProperty("error")
  })

  it("should return error when network fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"))

    const result = await loginRequest("admin@test.com", "password123")

    expect(result).toHaveProperty("error")
    expect((result as { error: string }).error).toBe("Network error")
  })

  it("should return error for short password (client-side validation)", async () => {
    const result = await loginRequest("admin@test.com", "ab")

    expect(result).toHaveProperty("error")
    expect(mockPost).not.toHaveBeenCalled()
  })

  it("should return error for empty email", async () => {
    const result = await loginRequest("", "password123")

    expect(result).toHaveProperty("error")
    expect(mockPost).not.toHaveBeenCalled()
  })
})
