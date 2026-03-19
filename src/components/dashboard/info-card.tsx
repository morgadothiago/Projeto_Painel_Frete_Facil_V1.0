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
      background: "#F0FDFA",
      borderRadius: 14,
      border: "1px solid #CCFBF1",
      padding: "16px 18px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: "#0C6B6420",
        color: "#0C6B64",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: "0 0 3px" }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, margin: "0 0 10px" }}>
          {description}
        </p>
        <a href={linkHref} style={{
          fontSize: 12, fontWeight: 600, color: "#0C6B64",
          textDecoration: "none",
        }}>
          {linkLabel} →
        </a>
      </div>
    </div>
  );
}
