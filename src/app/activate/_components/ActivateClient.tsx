"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { activateAccount, resendActivationEmail } from "@/app/actions/activation"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"

type Status = "loading" | "success" | "error" | "resend"

export function ActivateClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("resend")
      setMessage("Nenhum token de ativação encontrado.")
      return
    }

    async function activate() {
      const result = await activateAccount(token!)
      if (result.success) {
        setStatus("success")
        setMessage("Sua conta foi ativada com sucesso!")
      } else {
        setStatus("error")
        setMessage(result.error ?? "Erro ao ativar conta.")
      }
    }

    activate()
  }, [token])

  async function handleResend() {
    if (!email) return

    setSending(true)
    const result = await resendActivationEmail(email)
    setSending(false)

    if (result.success) {
      setStatus("success")
      setMessage("E-mail de ativação enviado! Verifique sua caixa de entrada.")
    } else {
      setMessage(result.error ?? "Erro ao enviar e-mail.")
    }
  }

  if (status === "loading") {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 32px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <Loader2 style={{
          width: 48,
          height: 48,
          color: "#0C6B64",
          animation: "spin 0.9s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0F172A" }}>
          Ativando sua conta...
        </p>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 32px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle style={{ width: 32, height: 32, color: "#16A34A" }} />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
          Conta ativada!
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
          {message}
        </p>
        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(12,107,100,0.3)",
          }}
        >
          Ir para o login
        </button>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 32px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FFF1F2, #FECDD3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <XCircle style={{ width: 32, height: 32, color: "#DC2626" }} />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
          Erro na ativação
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
          {message}
        </p>
        <button
          onClick={() => setStatus("resend")}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(12,107,100,0.3)",
          }}
        >
          Reenviar e-mail de ativação
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "40px 32px",
      textAlign: "center",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <Mail style={{ width: 32, height: 32, color: "#3B82F6" }} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
        Ativar sua conta
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
        {message || "Informe seu e-mail para receber um novo link de ativação."}
      </p>
      
      <div style={{ marginBottom: 16 }}>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #E2E8F0",
            borderRadius: 10,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleResend}
        disabled={sending || !email}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: sending || !email
            ? "#E2E8F0"
            : "linear-gradient(135deg, #0C6B64, #2EC4B6)",
          color: sending || !email ? "#94A3B8" : "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          cursor: sending || !email ? "not-allowed" : "pointer",
          boxShadow: sending || !email ? "none" : "0 4px 14px rgba(12,107,100,0.3)",
        }}
      >
        {sending ? (
          <>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 0.9s linear infinite", marginRight: 8 }} />
            Enviando...
          </>
        ) : (
          "Enviar link de ativação"
        )}
      </button>

      <p style={{ margin: "20px 0 0", fontSize: 13 }}>
        <a href="/" style={{ color: "#0C6B64", textDecoration: "none", fontWeight: 600 }}>
          Voltar para o login
        </a>
      </p>
    </div>
  )
}
