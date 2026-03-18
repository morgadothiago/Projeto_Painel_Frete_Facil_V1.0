import { ArrowLeft, CheckCircle2, Clock, BarChart3, Headphones } from "lucide-react";
import Link from "next/link";

import { tenantConfig } from "@/config/tenant";
import { SignupForm }   from "./_components/SignupForm";

export default function SignupPage() {
  const { name, shortName, theme: t } = tenantConfig;

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* ── Esquerda: Brand ───────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #0C6B64 0%, #0F9D96 55%, #1ABFB8 100%)",
          padding: "44px 48px",
        }}
      >
        {/* Decorativos */}
        <div style={{
          position: "absolute", bottom: -100, right: -100,
          width: 380, height: 380, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -60, left: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.04 }} aria-hidden>
          <defs>
            <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>

        {/* Logo */}
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

        {/* Conteúdo */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 20 }}>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 100, padding: "5px 13px",
            marginBottom: 22, alignSelf: "flex-start",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A8F0E8" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
              Cadastro Gratuito
            </span>
          </div>

          <h1 style={{
            fontSize: 34, fontWeight: 800, color: "#fff",
            lineHeight: 1.22, letterSpacing: "-0.7px",
            margin: "0 0 16px", maxWidth: 320,
          }}>
            Comece a gerenciar seus fretes hoje
          </h1>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            lineHeight: 1.7, margin: "0 0 36px", maxWidth: 290,
          }}>
            Configure sua conta empresarial em menos de 3 minutos. Sem cartão de crédito.
          </p>

          {/* Benefícios */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { Icon: CheckCircle2, text: "Cotação instantânea de fretes"       },
              { Icon: Clock,        text: "Rastreamento em tempo real"           },
              { Icon: BarChart3,    text: "Relatórios e dashboard completo"      },
              { Icon: Headphones,   text: "Suporte dedicado para empresas"       },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 14, height: 14, color: "#A8F0E8" }} />
                </div>
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div style={{
          position: "relative", zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: 24,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            Já tem uma conta?{" "}
            <Link href="/" style={{ color: "#fff", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
              Entrar na plataforma
            </Link>
          </p>
        </div>
      </div>

      {/* ── Direita: Formulário ───────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        padding: "0 32px",
        background: "#FAFAFA",
        backgroundImage: `radial-gradient(${t.border} 1.2px, transparent 1.2px)`,
        backgroundSize: "28px 28px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 480, paddingTop: 44, paddingBottom: 44 }}>

          {/* Logo mobile */}
          <div className="flex lg:hidden flex-col items-center" style={{ marginBottom: 32 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: "linear-gradient(155deg, #0C6B64, #1ABFB8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 8,
            }}>
              {shortName}
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary }}>{name}</span>
          </div>

          {/* Voltar (mobile) */}
          <Link
            href="/"
            className="flex lg:hidden"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600, color: t.textSecondary,
              marginBottom: 20,
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Voltar ao login
          </Link>

          {/* Card */}
          <div style={{
            background: "#fff",
            borderRadius: 20,
            padding: "36px 36px 32px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 60px -10px rgba(0,0,0,0.08)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: t.primaryLight, borderRadius: 8,
                padding: "4px 10px", marginBottom: 14,
              }}>
                <CheckCircle2 style={{ width: 12, height: 12, color: t.primary }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: t.primary, letterSpacing: "0.05em" }}>
                  CONTA EMPRESARIAL
                </span>
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: t.textPrimary,
                margin: "0 0 5px", letterSpacing: "-0.4px",
              }}>
                Criar conta gratuita
              </h2>
              <p style={{ fontSize: 13.5, color: t.textSecondary, margin: 0, lineHeight: 1.55 }}>
                Preencha os dados abaixo para começar a usar a plataforma.
              </p>
            </div>

            <SignupForm />
          </div>

          {/* Já tem conta — desktop */}
          <p className="hidden lg:block" style={{
            marginTop: 22, textAlign: "center",
            fontSize: 13.5, color: t.textSecondary,
          }}>
            Já tem uma conta?{" "}
            <Link href="/" style={{ fontWeight: 700, color: t.primary }}>
              Entrar na plataforma
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
