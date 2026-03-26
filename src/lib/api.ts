import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { auth } from "@/auth"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001"

// ─── Tipos de erro da API (padronizado pelo ExceptionFilter) ───────────

export type ApiErrorResponse = {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

// ─── Mensagens amigáveis por status code ────────────────────────────────

const FRIENDLY_MESSAGES: Record<number, string> = {
  400: "Os dados enviados são inválidos. Verifique os campos e tente novamente.",
  401: "Sua sessão expirou. Por favor, faça login novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "O recurso solicitado não foi encontrado.",
  409: "Este registro já existe ou conflita com dados existentes.",
  422: "Não foi possível processar os dados enviados.",
  429: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  500: "Erro interno do servidor. Tente novamente em alguns instantes.",
  502: "O servidor está temporariamente indisponível. Tente novamente.",
  503: "Serviço indisponível. Tente novamente em alguns minutos.",
}

// ─── Helper: extrair mensagem amigável do erro ──────────────────────────

export function getErrorMessage(error: unknown): string {
  // Erro do Axios
  if (error instanceof Error && "isAxiosError" in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.message

    // Se a API retornou uma mensagem em português, usa ela
    if (apiMessage) {
      return apiMessage
    }

    // Senão, usa mensagem amigável pelo status code
    if (status && FRIENDLY_MESSAGES[status]) {
      return FRIENDLY_MESSAGES[status]
    }

    // Fallback para erros de rede
    if (axiosError.code === "ECONNABORTED") {
      return "A requisição demorou demais. Verifique sua conexão e tente novamente."
    }

    if (axiosError.code === "ERR_NETWORK") {
      return "Não foi possível conectar ao servidor. Verifique sua conexão de internet."
    }
  }

  // Erro genérico
  if (error instanceof Error) {
    return error.message
  }

  return "Ocorreu um erro inesperado. Tente novamente."
}

// ─── Helper: verificar tipo de erro ─────────────────────────────────────

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && "isAxiosError" in error
    && (error as AxiosError).response?.status === 401
}

export function isForbiddenError(error: unknown): boolean {
  return error instanceof Error && "isAxiosError" in error
    && (error as AxiosError).response?.status === 403
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && "isAxiosError" in error
    && (error as AxiosError).response?.status === 429
}

export function isServerError(error: unknown): boolean {
  const status = error instanceof Error && "isAxiosError" in error
    ? (error as AxiosError).response?.status
    : undefined
  return status !== undefined && status >= 500
}

// ─── Instância principal ───────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// ─── Request: injeta Bearer token automaticamente ──────────────────────

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await auth()

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response: trata erros globalmente ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status
    const apiMessage = error.response?.data?.message

    if (status === 401) {
      console.warn("[API] Sessão expirada ou não autorizado")
    }

    if (status === 429) {
      console.warn("[API] Rate limit atingido")
    }

    if (status && status >= 500) {
      console.error("[API] Erro do servidor:", apiMessage || error.message)
    }

    return Promise.reject(error)
  },
)

// ─── Helper: chamada sem autenticação (login, signup, etc) ──────────────

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

publicApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status

    if (status && status >= 500) {
      console.error("[PublicAPI] Erro do servidor:", error.response?.data?.message || error.message)
    }

    return Promise.reject(error)
  },
)
