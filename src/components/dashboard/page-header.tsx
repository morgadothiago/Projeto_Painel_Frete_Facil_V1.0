import { Plus } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Label pequena em uppercase acima do título (ex: role do usuário) */
  label?: string;
  /** Botão de ação principal */
  actionLabel?: string;
  actionHref?: string;
  /** Exibe a ilustração do caminhão. Default: true */
  showTruck?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  label,
  actionLabel,
  actionHref,
  showTruck = true,
}: PageHeaderProps) {
  return (
    <div style={{
      background: t.gradientPrimary,
      borderRadius: t.radiusLg,
      padding: "20px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "relative", overflow: "hidden",
      flexShrink: 0,
      boxShadow: `0 6px 24px ${t.primary}30`,
    }}>
      {/* Círculos decorativos */}
      <div style={{ position: "absolute", top: -40, right: 180, width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, right: 50, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

      {/* Texto */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {label && (
          <p style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4,
          }}>
            {label}
          </p>
        )}
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: "#fff",
          margin: subtitle ? "0 0 4px" : 0, letterSpacing: "-0.3px",
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Direita: caminhão + ação */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
        {showTruck && (
          <svg viewBox="0 0 160 90" fill="none" style={{ width: 96, height: 54, opacity: 0.9, flexShrink: 0 }} aria-hidden>
            <rect x="8" y="22" width="84" height="44" rx="7" fill="rgba(255,255,255,0.28)" />
            <path d="M92 30h30l18 18v18H92V30z" fill="rgba(255,255,255,0.28)" />
            <rect x="16" y="28" width="34" height="20" rx="3" fill="rgba(255,255,255,0.5)" />
            <rect x="96" y="34" width="22" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
            <circle cx="32" cy="68" r="11" fill="rgba(255,255,255,0.3)" />
            <circle cx="32" cy="68" r="5" fill="rgba(255,255,255,0.6)" />
            <circle cx="116" cy="68" r="11" fill="rgba(255,255,255,0.3)" />
            <circle cx="116" cy="68" r="5" fill="rgba(255,255,255,0.6)" />
            <rect x="0" y="79" width="160" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
          </svg>
        )}
        {actionLabel && actionHref && (
          <a href={actionHref} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "11px 22px", borderRadius: t.radiusXl,
            background: t.secondary, color: t.textPrimary,
            fontWeight: 800, fontSize: 13.5, textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
            flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Plus style={{ width: 14, height: 14 }} />
            {actionLabel}
          </a>
        )}
      </div>
    </div>
  );
}
