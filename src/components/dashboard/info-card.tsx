type InfoCardProps = {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  linkLabel:   string;
  linkHref:    string;
};

export function InfoCard({ icon, title, description, linkLabel, linkHref }: InfoCardProps) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
      borderRadius: 16,
      border: "1px solid #E2E8F0",
      padding: "18px 20px",
      display: "flex", alignItems: "flex-start", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: "#0C6B6415",
        color: "#0C6B64",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: "0 0 4px" }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, margin: "0 0 12px" }}>
          {description}
        </p>
        <a href={linkHref} style={{
          fontSize: 12.5, fontWeight: 600, color: "#0C6B64",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {linkLabel} <span style={{ fontSize: 14 }}>→</span>
        </a>
      </div>
    </div>
  );
}
