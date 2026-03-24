import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export type LoginResponse = {
  access_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
    status: string
  }
}

export type LoginError = {
  error: string
}

// ─── Toggle mock/DB/API ───────────────────────────────────────────────────────
// NEXT_PUBLIC_USE_MOCK=true  → dados falsos (sem banco, sem API)
// NEXT_PUBLIC_USE_MOCK=false → banco de dados local (Prisma/SQLite)
// Quando tiver API externa: troque loginRequest para chamar a API
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse | LoginError | null> {
  if (USE_MOCK) {
    const { mockLogin } = await import("./mock/auth.mock")
    const result = await mockLogin(email, password)
    if (!result) return { error: "Email ou senha inválidos." }
    return result
  }

  // Login direto no banco via Prisma
  try {
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return { error: "Email ou senha inválidos." }
    }

    if (user.status === "INACTIVE") {
      return { error: "Conta INACTIVE. Verifique seu e-mail para ativar a conta." }
    }

    if (user.status === "PENDING") {
      return { error: "Conta aguardando aprovação do administrador." }
    }

    if (user.status === "BLOCKED") {
      return { error: "Conta inativa. Entre em contato com o suporte." }
    }

    if (user.status !== "ACTIVE") {
      return { error: "Conta não está ativa." }
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return { error: "Email ou senha inválidos." }
    }

    return {
      access_token: "db-session",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    }
  } catch (err) {
    console.error("[authService] loginRequest error:", err)
    return { error: "Erro ao fazer login. Tente novamente." }
  }
}
