type StatCardProps = {
  icon:   React.ReactNode;
  label:  string;
  value:  string;
  sub:    string;
  accent: string;
};

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 14,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Ícone */}
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: `${accent}14`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
      }}>
        <span style={{ width: 18, height: 18, display: "flex" }}>{icon}</span>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
          {value}
        </p>
      </div>

      {/* Sub badge */}
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: accent,
        background: `${accent}12`,
        padding: "3px 8px", borderRadius: 6,
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {sub}
      </span>
    </div>
  );
}
