import { ChevronRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
};

export function InfoCard({ icon, title, description, linkLabel, linkHref }: InfoCardProps) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusLg,
      padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.03)",
      flex: 1,
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>

      {/* Faixa de cor no topo */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3,
        background: t.gradientPrimary,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>

        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: t.primaryLight,
          color: t.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 13.5, fontWeight: 700, color: t.textPrimary,
            margin: "0 0 5px",
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 12.5, color: t.textSecondary,
            lineHeight: 1.6, margin: "0 0 14px",
          }}>
            {description}
          </p>
          <a href={linkHref} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12.5, fontWeight: 700, color: t.primary,
            textDecoration: "none",
          }}>
            {linkLabel} <ChevronRight style={{ width: 13, height: 13 }} />
          </a>
        </div>

      </div>
    </div>
  );
}
