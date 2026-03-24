"use client";

import { useActionState, useRef, useState } from "react";
import { verifyResetCode, requestPasswordReset } from "@/app/actions/password-reset";

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

export function VerifyCodeForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(verifyResetCode, null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const codeRef = useRef<HTMLInputElement | null>(null);

  function handleBoxInput(i: number, value: string) {
    if (value.length === 1 && i < 5) inputs.current[i + 1]?.focus();
    const digits = inputs.current.map((el) => el?.value ?? "").join("");
    if (codeRef.current) codeRef.current.value = digits;
  }

  function handleBoxKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !e.currentTarget.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function handleResend() {
    setResending(true);
    const fd = new FormData();
    fd.set("email", email);
    await requestPasswordReset(null, fd);
    setResending(false);
    setResent(true);
    // Limpa os inputs de código
    inputs.current.forEach((el) => { if (el) el.value = ""; });
    inputs.current[0]?.focus();
    if (codeRef.current) codeRef.current.value = "";
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="code" ref={codeRef} />

      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "#F0FDF9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, marginBottom: 16,
        }}>📬</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
          Verifique seu e-mail
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.55 }}>
          Enviamos um código de 6 dígitos para{" "}
          <strong style={{ color: "#0F172A" }}>{email}</strong>
        </p>
        <p style={{ fontSize: 12, color: "#94A3B8", margin: "6px 0 0" }}>
          O código expira em 15 minutos.
        </p>
      </div>

      {/* 6 caixas de dígito */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]"
            style={{
              width: 46, height: 52,
              textAlign: "center",
              fontSize: 22, fontWeight: 700,
              border: "1.5px solid #E2E8F0",
              borderRadius: 12,
              background: "#F8FAFC",
              color: "#0C6B64",
              outline: "none",
            }}
            onChange={(e) => handleBoxInput(i, e.target.value)}
            onKeyDown={(e) => handleBoxKey(i, e)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {resent && (
        <p style={{ fontSize: 13, color: "#059669", background: "#ECFDF5", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px", textAlign: "center" }}>
          Código reenviado com sucesso!
        </p>
      )}

      {state?.error && (
        <p style={{ fontSize: 13, color: "#DC2626", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px", textAlign: "center" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ ...BTN, opacity: pending ? 0.7 : 1 }}>
        {pending ? "Verificando..." : "Verificar código"}
      </button>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            background: "none", border: "none", cursor: resending ? "not-allowed" : "pointer",
            fontSize: 13, color: "#0C6B64", fontWeight: 600, padding: 0,
            opacity: resending ? 0.6 : 1,
          }}
        >
          {resending ? "Reenviando..." : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
