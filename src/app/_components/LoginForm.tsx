"use client";

import { useActionState, useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { InputField }                   from "@/components/ui/input-field";
import { tenantConfig }                 from "@/config/tenant";

const { theme: t } = tenantConfig;

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, null);
  const [showPass, setShowPass]  = useState(false);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* E-mail */}
      <InputField
        label="E-mail"
        name="email"
        type="email"
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

      {/* Erro */}
      {state?.error && (
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>

    </form>
  );
}
