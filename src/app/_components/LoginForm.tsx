"use client";

import { useActionState, useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
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
      toast.warning("Pagamento pendente", {
        description: "Regularize seu pagamento para acessar a plataforma.",
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
