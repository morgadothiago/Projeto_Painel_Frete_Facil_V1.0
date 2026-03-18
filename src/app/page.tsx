import { Zap, MapPin, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";
import { LoginForm }    from "@/app/_components/LoginForm";
import { SuccessBanner } from "@/app/_components/SuccessBanner";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string }>;
}) {
  const { name, shortName, theme: t } = tenantConfig;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "inherit" }}>

      {/* ── Esquerda: Brand ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #0C6B64 0%, #0F9D96 55%, #1ABFB8 100%)",
          padding: "44px 48px",
        }}
      >
        {/* Decorativos */}
        <div style={{
          position: "absolute", bottom: -120, right: -120,
          width: 420, height: 420, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 280, height: 280, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }} />
        {/* Linhas decorativas diagonais */}
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
            fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px",
          }}>
            {shortName}
          </div>
          <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 700, fontSize: 16, letterSpacing: "0.01em" }}>
            {name}
          </span>
        </div>

        {/* Conteúdo central */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 32 }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 100, padding: "5px 13px",
            marginBottom: 24, alignSelf: "flex-start",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A8F0E8" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
              Plataforma de Logística
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: "#fff",
            lineHeight: 1.22, letterSpacing: "-0.8px",
            margin: "0 0 18px", maxWidth: 340,
          }}>
            Gerencie sua logística com mais eficiência
          </h1>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.72)",
            lineHeight: 1.7, margin: "0 0 40px", maxWidth: 300,
          }}>
            Cotações, rastreamento e pagamentos em uma plataforma integrada.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { Icon: Zap,         text: "Cotação de fretes em tempo real"    },
              { Icon: MapPin,      text: "Rastreamento GPS integrado"          },
              { Icon: ShieldCheck, text: "Pagamentos online com segurança"     },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 15, height: 15, color: "#A8F0E8" }} />
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats rodapé */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", gap: 0,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: 28,
        }}>
          {[
            { value: "21+",   label: "Empresas"    },
            { value: "100%",  label: "Online"      },
            { value: "GPS",   label: "Integrado"   },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              style={{
                flex: 1, textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none",
              }}
            >
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                {value}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Direita: Formulário ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 32px",
        background: "#FAFAFA",
        /* dot grid sutil */
        backgroundImage: `radial-gradient(${t.border} 1.2px, transparent 1.2px)`,
        backgroundSize: "28px 28px",
        position: "relative",
      }}>

        {/* Logo mobile */}
        <div className="flex lg:hidden flex-col items-center" style={{ marginBottom: 36 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: "linear-gradient(155deg, #0C6B64, #1ABFB8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            marginBottom: 10,
            boxShadow: `0 8px 24px ${t.primary}40`,
          }}>
            {shortName}
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: t.textPrimary }}>{name}</span>
        </div>

        {/* Form container — sem card, conteúdo flutuante */}
        <div style={{
          width: "100%", maxWidth: 380,
          background: "#fff",
          borderRadius: 20,
          padding: "40px 36px 36px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 60px -10px rgba(0,0,0,0.08)",
        }}>

          {/* Cabeçalho */}
          <div style={{ marginBottom: 30 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: t.primaryLight, borderRadius: 8,
              padding: "4px 10px", marginBottom: 16,
            }}>
              <CheckCircle2 style={{ width: 12, height: 12, color: t.primary }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: t.primary, letterSpacing: "0.05em" }}>
                ACESSO SEGURO
              </span>
            </div>
            <h2 style={{
              fontSize: 24, fontWeight: 800, color: t.textPrimary,
              margin: "0 0 6px", letterSpacing: "-0.5px", lineHeight: 1.25,
            }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: 14, color: t.textSecondary, margin: 0, lineHeight: 1.55 }}>
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <SuccessBanner searchParams={searchParams} />
          <LoginForm />

          {/* Link esqueci senha */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <a
              href="#"
              style={{
                fontSize: 13, fontWeight: 600, color: t.textSecondary,
                textDecoration: "none", transition: "color 0.15s",
              }}
            >
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        {/* Criar conta */}
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 13.5, color: t.textSecondary, margin: 0 }}>
            Não tem conta?
          </p>
          <a
            href="/signup"
            style={{
              fontSize: 13.5, fontWeight: 700, color: t.primary,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
            }}
          >
            Criar conta grátis
            <ArrowRight style={{ width: 13, height: 13 }} />
          </a>
        </div>

      </div>
    </div>
  );
}
