import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/auth.config"
import { loginRequest } from "@/services/authService"

const STATUS_CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await loginRequest(
          credentials.email as string,
          credentials.password as string,
        )

        // Se retornou null ou erro, não autoriza
        if (!result) return null
        if ("error" in result) return null

        // É um LoginResponse válido
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          accessToken: result.access_token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Primeiro login: popula o token
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.status = (user as { status?: string }).status
        token.statusCheckedAt = Date.now()
        token.accessToken = (user as { accessToken?: string }).accessToken

        // Buscar companyId se for COMPANY
        const role = (user as { role?: string }).role
        if (role === "COMPANY") {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/companies/me`,
              {
                headers: {
                  Authorization: `Bearer ${(user as { accessToken?: string }).accessToken}`,
                },
              },
            )
            if (response.ok) {
              const company = await response.json()
              if (company?.id) token.companyId = company.id
            }
          } catch (err) {
            console.error("Erro ao buscar companyId:", err)
          }
        }
        return token
      }

      // Sem token válido (usuário não autenticado) → não faz chamadas à API
      if (!token.id) return token

      // Nas chamadas seguintes: re-verifica o status na API a cada 5 min
      const now = Date.now()
      const lastCheck = (token.statusCheckedAt as number) ?? 0

      if (now - lastCheck > STATUS_CHECK_INTERVAL_MS) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/user/${token.id}`, {
            headers: { Authorization: `Bearer ${token.accessToken as string}` },
          })

          if (response.ok) {
            const freshUser = await response.json()
            token.status = freshUser.status
            token.statusCheckedAt = now

            // Status mudou para não-ativo → invalida sessão imediatamente
            if (freshUser.status !== "ACTIVE") return null as never
          }
        } catch (err) {
          console.error("Erro ao verificar status:", err)
          // Erro de API: mantém sessão para não derrubar por falha transitória
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.status = token.status as string
      session.accessToken = token.accessToken as string
      if (token.companyId) {
        session.user.company = { id: token.companyId }
      }
      return session
    },
  },
})
