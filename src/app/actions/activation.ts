"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type ActivateResult = {
  success: boolean
  error?: string
}

export async function activateAccount(token: string): Promise<ActivateResult> {
  if (!token || token.length < 10) {
    return { success: false, error: "Token inválido." }
  }

  try {
    const activationToken = await db.activationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!activationToken) {
      return { success: false, error: "Token inválido ou já utilizado." }
    }

    if (activationToken.used) {
      return { success: false, error: "Este link já foi utilizado." }
    }

    if (activationToken.expiresAt < new Date()) {
      return { success: false, error: "Este link expirou. Solicite um novo." }
    }

    if (activationToken.user.status === "ACTIVE") {
      return { success: false, error: "Sua conta já está ativa." }
    }

    await db.$transaction([
      db.user.update({
        where: { id: activationToken.userId },
        data: { status: "ACTIVE" },
      }),
      db.activationToken.update({
        where: { id: activationToken.id },
        data: { used: true },
      }),
    ])

    revalidatePath("/activate")
    return { success: true }
  } catch (err) {
    console.error("[activateAccount]", err)
    return { success: false, error: "Erro ao ativar conta. Tente novamente." }
  }
}

export async function resendActivationEmail(email: string): Promise<ActivateResult> {
  if (!email) {
    return { success: false, error: "E-mail é obrigatório." }
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return { success: false, error: "E-mail não encontrado." }
    }

    if (user.status === "ACTIVE") {
      return { success: false, error: "Sua conta já está ativa." }
    }

    if (user.status !== "INACTIVE") {
      return { success: false, error: "Não é possível reenviar ativação para esta conta." }
    }

    await db.activationToken.deleteMany({
      where: { userId: user.id },
    })

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.activationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    const { sendAccountActivationEmail } = await import("@/lib/mailer")
    await sendAccountActivationEmail(user.email, user.name, token)

    return { success: true }
  } catch (err) {
    console.error("[resendActivationEmail]", err)
    return { success: false, error: "Erro ao reenviar e-mail. Tente novamente." }
  }
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function createActivationToken(userId: string): Promise<string> {
  await db.activationToken.deleteMany({
    where: { userId },
  })

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.activationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}
