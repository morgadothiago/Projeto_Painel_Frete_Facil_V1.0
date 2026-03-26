"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendAccountPendingEmail, sendAccountBlockedEmail, sendAccountActivatedEmail } from "@/lib/mailer"
import axios, { AxiosError } from "axios"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001"

// Helper: instância axios com token para server actions
function createAuthApi(token: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
}

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

  const api = createAuthApi((session as any).accessToken)

  try {
    const { data: result } = await api.get("/api/companies")

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

  const api = createAuthApi((session as any).accessToken)

  try {
    // Buscar dados da empresa antes de atualizar
    let companyEmail = ""
    let companyName = ""

    try {
      const { data: companyData } = await api.get(`/api/companies/${companyId}`)
      companyEmail = companyData?.user?.email ?? ""
      companyName = companyData?.user?.name ?? companyData?.tradeName ?? ""
    } catch {
      // Continua mesmo se não conseguir buscar dados da empresa
    }

    await api.patch(`/api/companies/${companyId}/status`, { status })

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
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao atualizar status" }
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

  const api = createAuthApi((session as any).accessToken)

  try {
    await api.post("/api/companies", data)
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao criar empresa" }
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

  const api = createAuthApi((session as any).accessToken)
  const role = session.user.role

  try {
    const url = role === "ADMIN"
      ? `/api/companies/${companyId}`
      : role === "COMPANY"
        ? `/api/companies/me`
        : null

    if (!url) return null

    const { data } = await api.get(url)
    return data
  } catch {
    return null
  }
}

// ── Onboarding: completar cadastro da empresa ────────────────────────────────

export async function isCompanyProfileComplete(): Promise<boolean> {
  const session = await auth()
  if (!session || session.user.role !== "COMPANY") return true

  const api = createAuthApi((session as any).accessToken)

  try {
    const { data: company } = await api.get("/api/companies/me")
    return company.addresses?.length > 0
  } catch {
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

  const api = createAuthApi((session as any).accessToken)
  const companyId = (session.user as any).company?.id
  if (!companyId) return { ok: false, error: "Empresa não encontrada" }

  try {
    await api.post(`/api/companies/${companyId}/addresses`, data)
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao salvar endereço" }
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

  const api = createAuthApi((session as any).accessToken)

  try {
    const { data } = await api.get(`/api/payments/company/${companyId}`)
    return data
  } catch {
    return []
  }
}

export async function getPaymentStats(companyId: string): Promise<PaymentStats | null> {
  const session = await auth()
  if (!session) return null

  const api = createAuthApi((session as any).accessToken)

  try {
    const { data } = await api.get(`/api/payments/company/${companyId}/stats`)
    return data
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

  const api = createAuthApi((session as any).accessToken)

  try {
    await api.post("/api/payments", data)
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao criar pagamento" }
  }

  return { ok: true }
}

export async function markPaymentAsPaid(paymentId: string, companyId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return { ok: false, error: "Sem permissão" }

  const api = createAuthApi((session as any).accessToken)

  try {
    // Buscar dados da empresa antes de atualizar
    let companyEmail = ""
    let companyName = ""

    try {
      const { data: companyData } = await api.get(`/api/companies/${companyId}`)
      companyEmail = companyData?.user?.email ?? ""
      companyName = companyData?.user?.name ?? companyData?.tradeName ?? ""
    } catch {
      // Continua mesmo se não conseguir buscar dados da empresa
    }

    // 1. Marca pagamento como PAGO
    await api.patch(`/api/payments/${paymentId}/status`, { status: "PAGO" })

    // 2. Reativa a empresa (se estava inativa por atraso)
    await api.patch(`/api/companies/${companyId}/status`, { status: "ACTIVE" })

    // 3. Enviar email de confirmação de pagamento
    if (companyEmail) {
      try {
        await sendAccountActivatedEmail(companyEmail, companyName)
      } catch (emailErr) {
        console.error("[markPaymentAsPaid] Erro ao enviar email:", emailErr)
      }
    }
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao atualizar pagamento" }
  }

  revalidatePath("/dashboard/empresas")
  return { ok: true }
}
