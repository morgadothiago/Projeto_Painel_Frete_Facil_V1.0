import { Plus } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({ icon, title, subtitle, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div style={{
      flex: 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: "36px 24px",
    }}>

      {/* Ícone */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: t.primaryLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        {icon}
      </div>

      <p style={{
        fontSize: 15, fontWeight: 700, color: t.textPrimary,
        margin: "0 0 6px", textAlign: "center",
        letterSpacing: "-0.2px",
      }}>
        {title}
      </p>
      <p style={{
        fontSize: 13, color: t.textSecondary,
        margin: "0 0 24px", textAlign: "center", lineHeight: 1.6,
      }}>
        {subtitle}
      </p>

      <a href={actionHref} style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "11px 26px", borderRadius: t.radiusXl,
        background: t.gradientPrimary, color: "#fff",
        fontWeight: 700, fontSize: 13.5, textDecoration: "none",
        boxShadow: `0 6px 18px ${t.primary}35`,
      }}>
        <Plus style={{ width: 14, height: 14 }} /> {actionLabel}
      </a>

    </div>
  );
}
