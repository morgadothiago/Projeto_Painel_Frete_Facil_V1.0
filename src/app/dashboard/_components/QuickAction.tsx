"use client";

import { useState }      from "react";
import { ChevronRight }  from "lucide-react";

export function QuickAction({ icon, label, sub, href, color }: {
  icon:  React.ReactNode;
  label: string;
  sub:   string;
  href:  string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 14px",
        borderRadius: 12,
        background: hovered ? "#F8FAFC" : "transparent",
        textDecoration: "none",
        transition: "background 0.15s",
        border: hovered ? "1px solid #E2E8F0" : "1px solid transparent",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: hovered ? `${color}18` : `${color}10`,
        color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.15s, transform 0.15s",
        transform: hovered ? "scale(1.05)" : "scale(1)",
      }}>
        <span style={{ width: 20, height: 20, display: "flex" }}>{icon}</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>{sub}</p>
      </div>

      <ChevronRight style={{
        width: 16, height: 16,
        color: hovered ? color : "#CBD5E1",
        transition: "color 0.15s, transform 0.15s",
        transform: hovered ? "translateX(2px)" : "translateX(0)",
        flexShrink: 0,
      }} />
    </a>
  );
}
