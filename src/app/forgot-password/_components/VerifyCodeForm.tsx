"use client";

import { useActionState, useRef } from "react";
import { verifyResetCode }         from "@/app/actions/password-reset";

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

  // 6 input boxes
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const codeRef = useRef<HTMLInputElement | null>(null);

  function handleBoxInput(i: number, value: string) {
    if (value.length === 1 && i < 5) inputs.current[i + 1]?.focus();
    // Concatena os valores para o campo hidden
    const digits = inputs.current.map((el) => el?.value ?? "").join("");
    if (codeRef.current) codeRef.current.value = digits;
  }

  function handleBoxKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !(e.currentTarget.value) && i > 0) {
      inputs.current[i - 1]?.focus();
    }
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
          Enviamos um código de 6 dígitos para <strong style={{ color: "#0F172A" }}>{email}</strong>
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

      {state?.error && (
        <p style={{ fontSize: 13, color: "#DC2626", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px", textAlign: "center" }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} style={{ ...BTN, opacity: pending ? 0.7 : 1 }}>
        {pending ? "Verificando..." : "Verificar código"}
      </button>

      <p style={{ fontSize: 12.5, color: "#94A3B8", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
        Não recebeu? Verifique a pasta de spam.
      </p>
    </form>
  );
}
