import { Suspense } from "react"
import { ActivateClient } from "./_components/ActivateClient"

export default function ActivatePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F0FDFA 0%, #F1F5F9 100%)",
      padding: "20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 900,
            color: "#0F172A",
            letterSpacing: "-0.5px",
          }}>
            Frete<span style={{ color: "#0C6B64" }}>Fácil</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748B" }}>
            Ativação de conta
          </p>
        </div>

        <Suspense fallback={<LoadingState />}>
          <ActivateClient />
        </Suspense>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "40px 32px",
      textAlign: "center",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "#F1F5F9",
        margin: "0 auto 16px",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
      <p style={{ margin: 0, fontSize: 14, color: "#64748B" }}>Carregando...</p>
    </div>
  )
}
