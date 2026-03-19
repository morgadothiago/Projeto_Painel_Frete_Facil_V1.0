type StatusConfig = {
  label: string;
  color: string;
  dot:   string;
  bg:    string;
};

export function StatusBadge({
  status,
  config,
}: {
  status: string;
  config: Record<string, StatusConfig>;
}) {
  const cfg = config[status] ?? Object.values(config)[0];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px 3px 7px",
      borderRadius: 20,
      background: cfg.bg,
      fontSize: 12, fontWeight: 600, color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
