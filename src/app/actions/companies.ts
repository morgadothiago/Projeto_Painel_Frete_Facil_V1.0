"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendAccountPendingEmail, sendAccountBlockedEmail, sendAccountActivatedEmail } from "@/lib/mailer"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001"

export type CompanyRow = {
  id: string
  userId: string
  cnpj: string
  tradeName: string | null
  status: string
  name: string
  email: string
  phone: string | null
  createdAt: string
}

export async function getCompanies(): Promise<CompanyRow[]> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  const token = (session as any).accessToken

  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error("Erro ao buscar empresas")

    const result = await response.json()
    return result.data.map((c: any) => ({
      id: c.id,
      userId: c.user.id,
      cnpj: c.cnpj,
      tradeName: c.tradeName,
      status: c.user.status,
      name: c.user.name,
      email: c.user.email,
      phone: c.user.phone,
      createdAt: c.user.createdAt,
    })) as CompanyRow[]
  } catch (err) {
    console.error("[getCompanies] CATCH:", err)
    return []
  }
}

export async function updateCompanyStatus(
  companyId: string,
  status: "ACTIVE" | "PENDING" | "INACTIVE",
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" }
  }

  const token = (session as any).accessToken

  try {
    // Buscar dados da empresa antes de atualizar
    const companyRes = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    let companyEmail = ""
    let companyName = ""

    if (companyRes.ok) {
      const companyData = await companyRes.json()
      companyEmail = companyData.data?.user?.email ?? ""
      companyName = companyData.data?.user?.name ?? companyData.data?.tradeName ?? ""
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      return { ok: false, error: err?.message ?? "Erro ao atualizar status" }
    }

    // Enviar email baseado no novo status
    if (companyEmail) {
      try {
        if (status === "PENDING") {
          await sendAccountPendingEmail(companyEmail, companyName)
        } else if (status === "INACTIVE") {
          await sendAccountBlockedEmail(companyEmail, companyName)
        } else if (status === "ACTIVE") {
          await sendAccountActivatedEmail(companyEmail, companyName)
        }
      } catch (emailErr) {
        console.error("[updateCompanyStatus] Erro ao enviar email:", emailErr)
      }
    }
  } catch (err) {
    console.error("[updateCompanyStatus]", err)
    return { ok: false, error: "Erro ao conectar com o servidor" }
  }

  revalidatePath("/dashboard/empresas")
  revalidatePath("/dashboard/faturamento")
  return { ok: true }
}

export async function createCompanyAction(data: {
  name: string
  email: string
  password: string
  phone?: string
  tradeName: string
  cnpj: string
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" }
  }

  const token = (session as any).accessToken

  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      return { ok: false, error: err?.message ?? "Erro ao criar empresa" }
    }
  } catch (err) {
    console.error("[createCompanyAction]", err)
    return { ok: false, error: "Erro ao criar empresa" }
  }

  revalidatePath("/dashboard/empresas")
  return { ok: true }
}

export type CompanyDetails = {
  id: string
  cnpj: string
  tradeName: string | null
  addresses: Array<{
    id: string
    street: string
    number: string
    complement: string | null
    neighborhood: string
    city: string
    state: string
    cep: string
  }>
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    status: string
    createdAt: string
  }
  _count: { deliveries: number }
}

export async function getCompanyDetails(companyId: string): Promise<CompanyDetails | null> {
  const session = await auth()
  if (!session) return null

  const token = (session as any).accessToken
  const role = session.user.role

  try {
    let url: string
    if (role === "ADMIN") {
      url = `${API_BASE_URL}/api/companies/${companyId}`
    } else if (role === "COMPANY") {
      url = `${API_BASE_URL}/api/companies/me`
    } else {
      return null
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// ── Onboarding: completar cadastro da empresa ────────────────────────────────

export async function isCompanyProfileComplete(): Promise<boolean> {
  const session = await auth()
  if (!session || session.user.role !== "COMPANY") return true

  const token = (session as any).accessToken

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.log("[onboarding] /api/companies/me returned", res.status)
      return true
    }
    const company = await res.json()
    console.log("[onboarding] addresses count:", company.addresses?.length ?? 0)
    return company.addresses?.length > 0
  } catch (err) {
    console.log("[onboarding] error:", err)
    return true
  }
}

export async function completeCompanyProfile(data: {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "COMPANY") {
    return { ok: false, error: "Sem permissão" }
  }

  const token = (session as any).accessToken
  const companyId = (session.user as any).company?.id
  if (!companyId) return { ok: false, error: "Empresa não encontrada" }

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies/${companyId}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => null)
      return { ok: false, error: err?.message ?? "Erro ao salvar endereço" }
    }
  } catch (err) {
    console.error("[completeCompanyProfile]", err)
    return { ok: false, error: "Erro ao conectar com o servidor" }
  }

  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Pagamentos ───────────────────────────────────────────────────────────────

export type Payment = {
  id: string
  companyId: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: string
  description: string | null
  createdAt: string
}

export type PaymentStats = {
  total: number
  paid: number
  pending: number
  overdue: number
  count: number
}

export async function getCompanyPayments(companyId: string): Promise<Payment[]> {
  const session = await auth()
  if (!session) return []

  const token = (session as any).accessToken

  try {
    const res = await fetch(`${API_BASE_URL}/api/payments/company/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function getPaymentStats(companyId: string): Promise<PaymentStats | null> {
  const session = await auth()
  if (!session) return null

  const token = (session as any).accessToken

  try {
    const res = await fetch(`${API_BASE_URL}/api/payments/company/${companyId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function createPayment(data: {
  companyId: string
  amount: number
  dueDate: string
  description?: string
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return { ok: false, error: "Sem permissão" }

  const token = (session as any).accessToken

  try {
    const res = await fetch(`${API_BASE_URL}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => null)
      return { ok: false, error: err?.message ?? "Erro ao criar pagamento" }
    }
  } catch (err) {
    console.error("[createPayment]", err)
    return { ok: false, error: "Erro ao conectar com o servidor" }
  }

  return { ok: true }
}

export async function markPaymentAsPaid(paymentId: string, companyId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return { ok: false, error: "Sem permissão" }

  const token = (session as any).accessToken

  try {
    // Buscar dados da empresa antes de atualizar
    const companyRes = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    let companyEmail = ""
    let companyName = ""

    if (companyRes.ok) {
      const companyData = await companyRes.json()
      companyEmail = companyData.data?.user?.email ?? ""
      companyName = companyData.data?.user?.name ?? companyData.data?.tradeName ?? ""
    }

    // 1. Marca pagamento como PAGO
    const res = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "PAGO" }),
    })

    if (!res.ok) return { ok: false, error: "Erro ao atualizar pagamento" }

    // 2. Reativa a empresa (se estava inativa por atraso)
    await fetch(`${API_BASE_URL}/api/companies/${companyId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "ACTIVE" }),
    })

    // 3. Enviar email de confirmação de pagamento
    if (companyEmail) {
      try {
        await sendAccountActivatedEmail(companyEmail, companyName)
      } catch (emailErr) {
        console.error("[markPaymentAsPaid] Erro ao enviar email:", emailErr)
      }
    }
  } catch {
    return { ok: false, error: "Erro ao conectar com o servidor" }
  }

  revalidatePath("/dashboard/empresas")
  return { ok: true }
}
