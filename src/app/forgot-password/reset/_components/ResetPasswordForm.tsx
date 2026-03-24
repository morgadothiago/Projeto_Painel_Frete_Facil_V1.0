"use client";

import { useActionState, useState } from "react";
import { resetPassword }             from "@/app/actions/password-reset";
import { Eye, EyeOff }               from "lucide-react";

const INPUT_WRAP: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "11px 40px 11px 14px",
  fontSize: 14,
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  outline: "none",
  boxSizing: "border-box",
  color: "#0F172A",
  background: "#F8FAFC",
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

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={INPUT_WRAP}>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required
        style={INPUT_STYLE}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0, display: "flex" }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function ResetPasswordForm({ email, code }: { email: string; code: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="code" value={code} />

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          Nova senha
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.55 }}>
          Defina uma nova senha para sua conta.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Nova senha
          </label>
          <PasswordInput name="password" placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Confirmar senha
          </label>
          <PasswordInput name="confirm" placeholder="Repita a senha" />
        </div>
      </div>

      {state?.error && (
        <p style={{ fontSize: 13, color: "#DC2626", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ ...BTN, opacity: pending ? 0.7 : 1 }}>
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
