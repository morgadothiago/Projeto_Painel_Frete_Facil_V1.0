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
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        background: hovered ? "#F8FAFC" : "transparent",
        textDecoration: "none",
        transition: "background 0.12s",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: hovered ? `${color}20` : `${color}12`,
        color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.12s",
      }}>
        <span style={{ width: 16, height: 16, display: "flex" }}>{icon}</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11.5, color: "#94A3B8", margin: "1px 0 0" }}>{sub}</p>
      </div>

      <ChevronRight style={{
        width: 14, height: 14,
        color: hovered ? color : "#CBD5E1",
        transition: "color 0.12s",
        flexShrink: 0,
      }} />
    </a>
  );
}
