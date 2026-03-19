"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Building2, UserCircle, Wallet } from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard";

type Tab = "empresas" | "usuarios" | "faturamento";

const TAB_META: Record<Tab, {
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  colorBg:  string;
  areaKey:  { main: string; new: string };
  areaName: { main: string; new: string };
}> = {
  empresas: {
    label:    "Empresas",
    icon:     <Building2  style={{ width: 13, height: 13 }} />,
    color:    "#0C6B64",
    colorBg:  "#0C6B6412",
    areaKey:  { main: "total", new: "novas" },
    areaName: { main: "Total", new: "Novas" },
  },
  usuarios: {
    label:    "Usuários",
    icon:     <UserCircle style={{ width: 13, height: 13 }} />,
    color:    "#3B82F6",
    colorBg:  "#3B82F612",
    areaKey:  { main: "total", new: "novas" },
    areaName: { main: "Total", new: "Novos" },
  },
  faturamento: {
    label:    "Faturamento",
    icon:     <Wallet style={{ width: 13, height: 13 }} />,
    color:    "#059669",
    colorBg:  "#05966912",
    areaKey:  { main: "total",          new: "novas"        },
    areaName: { main: "Acumulado (R$)", new: "No mês (R$)" },
  },
};

const TABS = (["empresas", "usuarios", "faturamento"] as Tab[]);

// ── Tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?:   boolean;
  payload?:  { name: string; value: number; color: string }[];
  label?:    string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      fontSize: 12.5,
      minWidth: 130,
      border: "1px solid #F1F5F9",
    }}>
      <p style={{ fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "#94A3B8" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────
export function AdminChart({ stats }: { stats?: DashboardStats | null }) {
  const [active, setActive] = useState<Tab>("empresas");
  const meta    = TAB_META[active];
  const color   = meta.color;

  const tabData = stats?.[active];
  const monthly = tabData?.monthly ?? [];
  const status  = tabData?.status  ?? [];
  const stat    = tabData?.stat    ?? { value: "—", label: "", new: "" };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column",
      flex: 1, minHeight: 0,
      overflow: "hidden",
    }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px 14px",
        borderBottom: "1px solid #F8FAFC",
        flexShrink: 0,
        gap: 12,
      }}>

        {/* Tabs */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "#F1F5F9",
          borderRadius: 10,
          padding: 3,
          gap: 2,
        }}>
          {TABS.map((key) => {
            const m        = TAB_META[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 11px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0F172A" : "#94A3B8",
                  background: isActive ? "#fff" : "transparent",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.12s",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: isActive ? m.color : "#CBD5E1", display: "flex" }}>
                  {m.icon}
                </span>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Stat rápido */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>
            {stat.value}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color, margin: "3px 0 0" }}>
            {stat.new}
          </p>
        </div>
      </div>

      {/* ── Gráficos ────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 180px",
        gap: 16,
        flex: 1, minHeight: 0,
        padding: "16px 18px 14px",
      }}>

        {/* Área: evolução mensal */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.07em",
            margin: "0 0 10px", flexShrink: 0,
          }}>
            Evolução mensal
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-main-${active}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.16} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id={`grad-new-${active}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.08} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10.5, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={meta.areaKey.main}
                  name={meta.areaName.main}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#grad-main-${active})`}
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey={meta.areaKey.new}
                  name={meta.areaName.new}
                  stroke={`${color}70`}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill={`url(#grad-new-${active})`}
                  dot={false}
                  activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: por status */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.07em",
            margin: "0 0 10px", flexShrink: 0,
          }}>
            Por status
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="qtd"
                  name="Total"
                  radius={[5, 5, 0, 0]}
                  fill={color}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
