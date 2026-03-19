export function ChartTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { name: string; value: number; color: string }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      fontSize: 12.5,
      minWidth: 130,
      border: "1px solid #F1F5F9",
    }}>
      <p style={{ fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "#94A3B8" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}
