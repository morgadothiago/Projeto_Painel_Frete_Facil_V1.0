import { ArrowUpRight } from "lucide-react";

type CardProps = {
  children:   React.ReactNode;
  title?:     string;
  icon?:      React.ReactNode;
  href?:      string;
  hrefLabel?: string;
  fill?:      boolean;
};

export function Card({ children, title, icon, href, hrefLabel = "Ver todos", fill }: CardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      display: "flex", flexDirection: "column",
      overflow: "visible",
      ...(fill ? { flex: 1, minHeight: 0 } : {}),
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 12px",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon && <span style={{ color: "#0C6B64", display: "flex", opacity: 0.7 }}>{icon}</span>}
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1E293B", letterSpacing: "-0.2px" }}>
              {title}
            </span>
          </div>
          {href && (
            <a href={href} style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12.5, fontWeight: 600, color: "#0C6B64",
              textDecoration: "none", padding: "4px 8px", borderRadius: 6,
              transition: "background 0.15s",
            }}>
              {hrefLabel} <ArrowUpRight style={{ width: 13, height: 13 }} />
            </a>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
