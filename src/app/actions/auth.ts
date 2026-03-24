"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { rateLimit, isValidEmail } from "@/lib/rate-limit"
import { loginRequest, type LoginError } from "@/services/authService"

export type LoginState = {
  error?: string
  code?: "BLOCKED" | "PENDING" | "INVALID" | "RATE_LIMIT" | "OVERDUE" | "INACTIVE"
} | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string

  if (!email || !isValidEmail(email)) {
    return { error: "E-mail inválido.", code: "INVALID" }
  }

  // Rate limit: máx 5 tentativas de login por e-mail por hora
  if (!rateLimit(`login:${email}`, 5, 60 * 60 * 1000)) {
    return {
      error: "Muitas tentativas. Aguarde antes de tentar novamente.",
      code: "RATE_LIMIT",
    }
  }

  // Verifica login diretamente antes do NextAuth para capturar erros específicos
  const result = await loginRequest(email, password)

  // Se retornou erro
  if (result && "error" in result) {
    const errorResult = result as LoginError

    if (errorResult.error.includes("PAGAMENTO_ATRASADO")) {
      return {
        error: "Sua conta está bloqueada por atraso no pagamento. Entre em contato com o suporte.",
        code: "OVERDUE",
      }
    }

    if (errorResult.error.includes("não ativa") || errorResult.error.includes("INACTIVE")) {
      return {
        error: "Sua conta ainda não foi ativada. Verifique seu e-mail ou solicite um novo link de ativação.",
        code: "INACTIVE",
      }
    }

    if (errorResult.error.includes("inativa") || errorResult.error.includes("Conta inativa")) {
      return { error: "Sua conta foi bloqueada.", code: "BLOCKED" }
    }

    if (errorResult.error.includes("aguardando") || errorResult.error.includes("aguardando aprovação")) {
      return { error: "Sua conta está aguardando aprovação do administrador.", code: "PENDING" }
    }

    return { error: "Email ou senha inválidos.", code: "INVALID" }
  }

  // Se retornou null
  if (!result) {
    return { error: "Email ou senha inválidos.", code: "INVALID" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/loading-screen",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email ou senha inválidos.", code: "INVALID" }
        default:
          return { error: "Erro ao entrar. Tente novamente." }
      }
    }
    throw error
  }
  return null
}

export async function signoutAction() {
  await signOut({ redirectTo: "/" })
}
