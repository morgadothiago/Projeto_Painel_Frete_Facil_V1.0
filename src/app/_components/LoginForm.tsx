"use client";

import { useActionState, useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { InputField }                   from "@/components/ui/input-field";
import { tenantConfig }                 from "@/config/tenant";

const { theme: t } = tenantConfig;

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null);
  const [showPass, setShowPass]  = useState(false);

  // Dispara toast quando o erro for de conta bloqueada ou pendente
  useEffect(() => {
    if (state?.code === "BLOCKED") {
      toast.error("Sua conta foi bloqueada", {
        description: "Verifique seu e-mail para mais informações.",
      });
    }
    if (state?.code === "PENDING") {
      toast.warning("Conta pendente", {
        description: "Sua conta está aguardando aprovação do administrador.",
      });
    }
    if (state?.code === "OVERDUE") {
      toast.error("Conta bloqueada por atraso", {
        description: "Sua conta está bloqueada por atraso no pagamento. Entre em contato com o suporte.",
        duration: 8000,
      });
    }
    if (state?.code === "RATE_LIMIT") {
      toast.error("Muitas tentativas", {
        description: "Aguarde alguns minutos antes de tentar novamente.",
      });
    }
  }, [state]);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* E-mail */}
      <InputField
        label="E-mail"
        name="email"
        type="text"
        placeholder="seu@email.com"
        required
        autoComplete="email"
        leftIcon={<Mail style={{ width: 16, height: 16 }} />}
      />

      {/* Senha */}
      <InputField
        label="Senha"
        name="password"
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        required
        autoComplete="current-password"
        leftIcon={<Lock style={{ width: 16, height: 16 }} />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 8,
              border: "none", background: "transparent",
              color: t.textSecondary, cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color       = t.primary;
              e.currentTarget.style.background  = t.primaryLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color       = t.textSecondary;
              e.currentTarget.style.background  = "transparent";
            }}
            aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPass
              ? <EyeOff style={{ width: 15, height: 15 }} />
              : <Eye    style={{ width: 15, height: 15 }} />
            }
          </button>
        }
      />

      {/* Conta não ativada */}
      {state?.code === "INACTIVE" && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 12,
          fontSize: 13, padding: "14px 16px", borderRadius: t.radiusMd,
          color: "#1D4ED8", background: "#EFF6FF",
          border: "1px solid #3B82F622",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
            <MailCheck style={{ width: 16, height: 16, marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Conta não ativada</p>
              <p style={{ margin: "4px 0 0", color: "#64748B" }}>
                Verifique seu e-mail ou solicite um novo link de ativação.
              </p>
            </div>
          </div>
          <a
            href="/activate"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "8px 16px", background: "#3B82F6", color: "#fff",
              borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 600,
            }}
          >
            Reenviar e-mail de ativação
          </a>
        </div>
      )}

      {/* Conta pendente (aguardando aprovação) */}
      {state?.code === "PENDING" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: "#B45309", background: "#FFFBEB",
          border: "1px solid #F59E0B22",
        }}>
          <AlertCircle style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Erro genérico (credenciais inválidas) */}
      {state?.code === "INVALID" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: t.error, background: "#FFF1F0",
          border: `1px solid ${t.error}22`,
        }}>
          <AlertCircle style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Conta bloqueada */}
      {state?.code === "BLOCKED" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: "#BE123C", background: "#FFF1F2",
          border: "1px solid #F43F5E22",
        }}>
          <AlertCircle style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Pagamento atrasado */}
      {state?.code === "OVERDUE" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: "#BE123C", background: "#FFF1F2",
          border: "1px solid #F43F5E22",
        }}>
          <AlertCircle style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Rate limit */}
      {state?.code === "RATE_LIMIT" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: "#B45309", background: "#FFFBEB",
          border: "1px solid #F59E0B22",
        }}>
          <AlertCircle style={{ width: 15, height: 15, marginTop: 1, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={pending}
        style={{
          width: "100%", height: 50,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          borderRadius: t.radiusXl,
          background: pending
            ? t.border
            : "linear-gradient(135deg, #0C6B64 0%, #1ABFB8 100%)",
          color: "#fff",
          fontWeight: 700, fontSize: 15,
          border: "none",
          cursor: pending ? "not-allowed" : "pointer",
          boxShadow: pending ? "none" : `0 4px 20px ${t.primary}45`,
          transition: "all 0.2s",
          marginTop: 4,
          letterSpacing: "0.01em",
        }}
      >
        {pending ? (
          <>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 0.9s linear infinite" }} />
            Entrando…
          </>
        ) : (
          "Entrar na plataforma"
        )}
      </button>

    </form>
  );
}
