import { ArrowUpRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type CardProps = {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  fill?: boolean;
};

export function Card({ children, title, icon, href, hrefLabel = "Ver todos", fill }: CardProps) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusLg,
      boxShadow: "0 2px 12px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...(fill ? { flex: 1, minHeight: 0 } : {}),
    }}>

      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 16px",
          borderBottom: `1px solid ${t.background}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {icon && (
              <span style={{ color: t.primary, display: "flex" }}>{icon}</span>
            )}
            <span style={{
              fontSize: 14.5, fontWeight: 700, color: t.textPrimary,
              letterSpacing: "-0.2px",
            }}>
              {title}
            </span>
          </div>
          {href && (
            <a href={href} style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12.5, fontWeight: 600, color: t.primary,
              textDecoration: "none", opacity: 0.85,
            }}>
              {hrefLabel} <ArrowUpRight style={{ width: 13, height: 13 }} />
            </a>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
