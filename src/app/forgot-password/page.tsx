import { tenantConfig }       from "@/config/tenant";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const { name, shortName, theme: t } = tenantConfig;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "inherit" }}>

      {/* ── Esquerda: Brand ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #0C6B64 0%, #0F9D96 55%, #1ABFB8 100%)",
          padding: "44px 48px",
        }}
      >
        <div style={{
          position: "absolute", bottom: -120, right: -120,
          width: 420, height: 420, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 280, height: 280, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "rgba(255,255,255,0.20)",
            border: "1px solid rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: "#fff",
          }}>
            {shortName}
          </div>
          <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 700, fontSize: 16 }}>
            {name}
          </span>
        </div>

        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, marginBottom: 28,
          }}>
            🔑
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.5px", margin: "0 0 16px", maxWidth: 320 }}>
            Recupere o acesso à sua conta
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, margin: 0, maxWidth: 280 }}>
            Enviaremos um código de verificação para o seu e-mail cadastrado em apenas alguns segundos.
          </p>
        </div>
      </div>

      {/* ── Direita: Formulário ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 32px",
        background: "#FAFAFA",
        backgroundImage: `radial-gradient(${t.border} 1.2px, transparent 1.2px)`,
        backgroundSize: "28px 28px",
      }}>

        {/* Logo mobile */}
        <div className="flex lg:hidden flex-col items-center" style={{ marginBottom: 36 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: "linear-gradient(155deg, #0C6B64, #1ABFB8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            marginBottom: 10,
          }}>
            {shortName}
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: t.textPrimary }}>{name}</span>
        </div>

        <div style={{
          width: "100%", maxWidth: 380,
          background: "#fff",
          borderRadius: 20,
          padding: "40px 36px 36px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 60px -10px rgba(0,0,0,0.08)",
        }}>
          <ForgotPasswordForm />
        </div>

        <div style={{ marginTop: 24 }}>
          <a href="/" style={{ fontSize: 13.5, fontWeight: 600, color: t.textSecondary, textDecoration: "none" }}>
            ← Voltar ao login
          </a>
        </div>
      </div>
    </div>
  );
}
