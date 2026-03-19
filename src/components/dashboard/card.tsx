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
      borderRadius: 14,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      ...(fill ? { flex: 1, minHeight: 0 } : {}),
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px 14px",
          borderBottom: "1px solid #F8FAFC",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {icon && <span style={{ color: "#0C6B64", display: "flex" }}>{icon}</span>}
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>
              {title}
            </span>
          </div>
          {href && (
            <a href={href} style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 12, fontWeight: 600, color: "#0C6B64",
              textDecoration: "none",
            }}>
              {hrefLabel} <ArrowUpRight style={{ width: 12, height: 12 }} />
            </a>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
