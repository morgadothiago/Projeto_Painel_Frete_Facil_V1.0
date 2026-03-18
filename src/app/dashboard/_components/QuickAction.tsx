"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

export function QuickAction({ icon, label, sub, href, color }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 13,
        background: hovered ? t.background : "transparent",
        borderRadius: t.radiusMd, padding: "11px 12px",
        textDecoration: "none",
        transition: "background 0.15s",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}14`,
        color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.15s",
        ...(hovered ? { background: `${color}22` } : {}),
      }}>
        <span style={{ width: 17, height: 17, display: "flex" }}>{icon}</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: t.textPrimary, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: "2px 0 0" }}>{sub}</p>
      </div>

      <ChevronRight style={{
        width: 15, height: 15,
        color: hovered ? color : t.textSecondary,
        transition: "color 0.15s",
        flexShrink: 0,
      }} />
    </a>
  );
}
