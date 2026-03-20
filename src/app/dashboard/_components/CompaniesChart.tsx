"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Building2, UserCircle, Wallet, TrendingUp, BarChart2 } from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard";
import { ChartTooltip } from "./ChartTooltip";

type Tab     = "empresas" | "usuarios" | "faturamento";
type ViewTab = "evolucao" | "status";

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

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ value, sub, color }: { value: string; sub: string; color: string }) {
  return (
    <div style={{ textAlign: "right", flexShrink: 0 }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>
        {value}
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, color, margin: "3px 0 0" }}>
        {sub}
      </p>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────
export function AdminChart({ stats }: { stats?: DashboardStats | null }) {
  const [active,   setActive]   = useState<Tab>("empresas");
  const [viewTab,  setViewTab]  = useState<ViewTab>("evolucao");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const meta  = TAB_META[active];
  const color = meta.color;

  const tabData = stats?.[active];
  const monthly = tabData?.monthly ?? [];
  const status  = tabData?.status  ?? [];
  const stat    = tabData?.stat    ?? { value: "—", label: "", new: "" };

  // ── MOBILE ────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #F1F5F9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* ── Header Mobile ─────────────────────────────────── */}
        <div style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid #F8FAFC",
          flexShrink: 0,
        }}>
          {/* Data category tabs */}
          <div style={{
            display: "flex",
            background: "#F8FAFC",
            borderRadius: 10, padding: 3,
            border: "1px solid #EEF2F7",
            marginBottom: 12,
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
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    padding: "6px 4px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11.5,
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

          {/* Stat summary row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px",
            background: `${color}0A`,
            borderRadius: 10,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Total
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1, letterSpacing: "-0.5px" }}>
                {stat.value}
              </p>
            </div>
            {stat.new && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: `${color}18`, borderRadius: 20, padding: "4px 10px",
              }}>
                <TrendingUp style={{ width: 10, height: 10, color }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color }}>
                  {stat.new}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── View toggle: Evolução / Por Status ─────────────── */}
        <div style={{
          display: "flex",
          padding: "10px 16px 0",
          gap: 4, flexShrink: 0,
        }}>
          {([
            { key: "evolucao" as ViewTab, label: "Evolução",  icon: <TrendingUp style={{ width: 11, height: 11 }} /> },
            { key: "status"   as ViewTab, label: "Por Status", icon: <BarChart2  style={{ width: 11, height: 11 }} /> },
          ]).map(({ key, label, icon }) => {
            const isActive = viewTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setViewTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 12px",
                  border: "none", borderRadius: 8,
                  fontSize: 11.5, fontWeight: isActive ? 700 : 500,
                  color: isActive ? color : "#94A3B8",
                  background: isActive ? `${color}12` : "transparent",
                  cursor: "pointer",
                  transition: "all 0.12s",
                  borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
                  borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                }}
              >
                <span style={{ display: "flex" }}>{icon}</span>
                {label}
              </button>
            );
          })}
          <div style={{ flex: 1, borderBottom: "1px solid #F1F5F9", alignSelf: "flex-end" }} />
        </div>

        {/* ── Chart area ─────────────────────────────────────── */}
        <div style={{ height: 200, padding: "10px 8px 8px 4px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewTab === "evolucao" ? (
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -22, bottom: 24 }}>
                <defs>
                  <linearGradient id={`m-grad-main-${active}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id={`m-grad-new-${active}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.08} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 9, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                  height={20}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={22}
                  domain={[0, (max: number) => Math.max(max, 4)]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 10, color: "#94A3B8" }} />
                <Area
                  type="monotone"
                  dataKey={meta.areaKey.main}
                  name={meta.areaName.main}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#m-grad-main-${active})`}
                  dot={false}
                  activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey={meta.areaKey.new}
                  name={meta.areaName.new}
                  stroke={`${color}60`}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill={`url(#m-grad-new-${active})`}
                  dot={false}
                  activeDot={{ r: 2, fill: color, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={status} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 24 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} vertical={true} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 10, color: "#94A3B8" }} />
                <Bar
                  dataKey="qtd"
                  name="Total"
                  radius={[0, 5, 5, 0]}
                  fill={color}
                  opacity={0.85}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column",
      height: 360,
      overflow: "hidden",
    }}>

      {/* Header */}
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

        <StatPill value={stat.value} sub={stat.new} color={color} />
      </div>

      {/* Charts grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        gap: 16,
        flex: 1,
        minHeight: 0,
        padding: "12px 18px 12px",
        overflow: "hidden",
        alignItems: "stretch",
      }}>
        {/* Área: evolução mensal */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.07em",
            margin: "0 0 10px", flexShrink: 0,
          }}>
            Evolução mensal
          </p>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 10, left: -20, bottom: 24 }}>
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
                  height={24}
                />
                <YAxis
                  tick={{ fontSize: 10.5, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={28}
                  domain={[0, (max: number) => Math.max(max, 5)]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
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
        </div>

        {/* Barras: por status */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.07em",
            margin: "0 0 10px", flexShrink: 0,
          }}>
            Por status
          </p>
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status} layout="vertical" margin={{ top: 4, right: 10, left: -20, bottom: 24 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} vertical={true} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                <Bar
                  dataKey="qtd"
                  name="Total"
                  radius={[0, 5, 5, 0]}
                  fill={color}
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
