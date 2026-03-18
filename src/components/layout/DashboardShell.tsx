"use client";

import { useState } from "react";
import { PanelLeft, Bell, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type User = {
  name?:  string | null;
  email?: string | null;
  image?: string | null;
  role?:  string;
};

type Props = {
  user:     User;
  initials: string;
  children: React.ReactNode;
};

export function DashboardShell({ user, initials, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: t.background,
    }}>

      <Sidebar user={user} collapsed={collapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* ── Header ──────────────────────────────────────── */}
        <header style={{
          height: 60,
          background: t.surface,
          display: "flex", alignItems: "center",
          padding: "0 20px 0 16px",
          gap: 10, flexShrink: 0,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>

          {/* Toggle sidebar */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            style={{
              width: 36, height: 36, borderRadius: t.radiusMd,
              background: "transparent", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: t.textSecondary, flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.background;
              e.currentTarget.style.color = t.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = t.textSecondary;
            }}
          >
            <PanelLeft style={{ width: 18, height: 18 }} />
          </button>

          {/* Busca */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 14px", borderRadius: t.radiusMd,
            background: t.background,
            flex: 1, maxWidth: 300, cursor: "text",
          }}>
            <Search style={{ width: 13, height: 13, color: t.textSecondary, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: t.textSecondary }}>Buscar…</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status online */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 500, color: t.textSecondary,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: t.success, display: "inline-block",
              boxShadow: `0 0 0 2px ${t.success}25`,
            }} />
            Online
          </div>

          {/* Notificações */}
          <button
            type="button"
            style={{
              width: 36, height: 36, borderRadius: t.radiusMd,
              background: "transparent", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: t.textSecondary, flexShrink: 0,
              transition: "background 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Bell style={{ width: 16, height: 16 }} />
          </button>

          {/* Divisor */}
          <div style={{ width: 1, height: 20, background: t.border, flexShrink: 0 }} />

          {/* Avatar + nome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            cursor: "pointer", padding: "4px 6px", borderRadius: t.radiusMd,
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: t.gradientPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, whiteSpace: "nowrap" }}>
              {user.name?.split(" ")[0] ?? user.email}
            </span>
          </div>

        </header>

        {/* ── Conteúdo ─────────────────────────────────── */}
        <main style={{
          flex: 1, overflow: "hidden",
          padding: "20px 24px",
          display: "flex", flexDirection: "column",
        }}>
          {children}
        </main>

      </div>
    </div>
  );
}
