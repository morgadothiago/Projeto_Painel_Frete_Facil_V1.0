import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
};

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusLg,
      padding: "22px 20px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    }}>

      {/* Ícone */}
      <div style={{
        width: 42, height: 42,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${accent}EE, ${accent}99)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff",
        boxShadow: `0 6px 16px ${accent}38`,
      }}>
        <span style={{ width: 20, height: 20, display: "flex" }}>{icon}</span>
      </div>

      {/* Valor + label */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{
          fontSize: 30, fontWeight: 800, color: t.textPrimary,
          lineHeight: 1, margin: 0, letterSpacing: "-1px",
        }}>
          {value}
        </p>
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: t.textSecondary, margin: 0,
        }}>
          {label}
        </p>
      </div>

      {/* Sub — texto colorido simples */}
      <p style={{
        fontSize: 11.5, fontWeight: 600,
        color: accent, margin: 0,
        letterSpacing: "0.02em",
      }}>
        {sub}
      </p>

    </div>
  );
}
