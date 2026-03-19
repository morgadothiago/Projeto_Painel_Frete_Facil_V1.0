type PageHeaderProps = {
  title:         string;
  subtitle?:     string;
  label?:        string;
  actionLabel?:  string;
  actionHref?:   string;
  showTruck?:    boolean;
};

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function PageHeader({
  title, subtitle, label, actionLabel, actionHref,
}: PageHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const adjustedTitle = title.replace("Olá", greeting);

  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      flexShrink: 0, gap: 24,
      paddingBottom: 8,
    }}>
      {/* Esquerda */}
      <div>
        {label && (
          <p style={{
            margin: "0 0 6px",
            fontSize: 12, fontWeight: 600,
            color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {label}
          </p>
        )}
        <h1 style={{
          margin: subtitle ? "0 0 6px" : 0,
          fontSize: 28, fontWeight: 700,
          color: "#0F172A", letterSpacing: "-0.6px", lineHeight: 1.2,
        }}>
          {adjustedTitle}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 14, color: "#64748B", fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Direita */}
      {actionLabel && actionHref && (
        <a href={actionHref} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px",
          borderRadius: 10,
          background: "#0C6B64",
          color: "#fff",
          fontWeight: 600, fontSize: 13.5,
          textDecoration: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(12,107,100,0.25)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}>
          {actionLabel}
        </a>
      )}
    </div>
  );
}
