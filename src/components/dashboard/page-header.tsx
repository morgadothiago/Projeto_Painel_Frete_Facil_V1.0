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
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0, gap: 16,
    }}>
      {/* Esquerda */}
      <div>
        {label && (
          <p style={{
            margin: "0 0 2px",
            fontSize: 11, fontWeight: 600,
            color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {label}
          </p>
        )}
        <h1 style={{
          margin: subtitle ? "0 0 3px" : 0,
          fontSize: 22, fontWeight: 800,
          color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Direita */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {/* Data atual */}
        <span style={{
          fontSize: 12.5, color: "#94A3B8", fontWeight: 500,
          whiteSpace: "nowrap",
        }}>
          {formatDate()}
        </span>

        {actionLabel && actionHref && (
          <a href={actionHref} style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "8px 16px",
            borderRadius: 9,
            background: "#0C6B64",
            color: "#fff",
            fontWeight: 600, fontSize: 13,
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(12,107,100,0.25)",
          }}>
            {actionLabel}
          </a>
        )}
      </div>
    </div>
  );
}
