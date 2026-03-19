"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset }      from "@/app/actions/password-reset";
import { VerifyCodeForm }            from "./VerifyCodeForm";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontSize: 14,
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  outline: "none",
  boxSizing: "border-box",
  color: "#0F172A",
  background: "#F8FAFC",
  transition: "border-color 0.15s",
};

const BTN: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
  letterSpacing: "0.02em",
};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  const [email, setEmail]        = useState("");

  // Quando o e-mail foi enviado com sucesso → mostra formulário de código
  if (state?.sent) {
    return <VerifyCodeForm email={email} />;
  }

  return (
    <form action={action}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          Esqueceu sua senha?
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.55 }}>
          Digite seu e-mail e enviaremos um código de verificação.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          E-mail cadastrado
        </label>
        <input
          type="text"
          name="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={INPUT_STYLE}
          autoFocus
        />
      </div>

      {state?.error && (
        <p style={{ fontSize: 13, color: "#DC2626", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ ...BTN, opacity: pending ? 0.7 : 1 }}>
        {pending ? "Enviando..." : "Enviar código"}
      </button>
    </form>
  );
}
