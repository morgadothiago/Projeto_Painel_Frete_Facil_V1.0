import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  icon:   React.ReactNode;
  label:  string;
  value:  string;
  sub:    string;
  accent: string;
  trend?: { value: number; isPositive: boolean } | null;
};

export function StatCard({ icon, label, value, sub, accent, trend }: StatCardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "20px 20px",
      display: "flex", flexDirection: "column",
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Barra colorida no topo */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 4, background: accent,
      }} />

      {/* Header com ícone */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
        }}>
          <span style={{ width: 22, height: 22, display: "flex" }}>{icon}</span>
        </div>

        {/* Trend indicator */}
        {trend && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 20,
            background: trend.isPositive ? "#DCFCE7" : "#FEE2E2",
            color: trend.isPositive ? "#16A34A" : "#DC2626",
            fontSize: 12, fontWeight: 600,
          }}>
            {trend.isPositive 
              ? <TrendingUp style={{ width: 12, height: 12 }} />
              : <TrendingDown style={{ width: 12, height: 12 }} />
            }
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Valor principal */}
      <p style={{ 
        margin: 0, 
        fontSize: 32, 
        fontWeight: 700, 
        color: "#0F172A", 
        lineHeight: 1, 
        letterSpacing: "-1px",
        fontFeatureSettings: "'tnum' on, 'lnum' on",
      }}>
        {value}
      </p>

      {/* Label e sub */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#475569" }}>
          {label}
        </p>
        <span style={{
          fontSize: 11.5, fontWeight: 500,
          color: accent,
        }}>
          {sub}
        </span>
      </div>
    </div>
  );
}