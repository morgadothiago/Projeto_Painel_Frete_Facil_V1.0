"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Building2, UserCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { tenantConfig } from "@/config/tenant";
import type { DashboardStats } from "@/app/actions/dashboard";

const { theme: t } = tenantConfig;

type Tab = "empresas" | "usuarios" | "faturamento";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "empresas",    label: "Empresas",    icon: <Building2  className="w-[13px] h-[13px]" /> },
  { key: "usuarios",    label: "Usuários",    icon: <UserCircle className="w-[13px] h-[13px]" /> },
  { key: "faturamento", label: "Faturamento", icon: <Wallet     className="w-[13px] h-[13px]" /> },
];

// ── Tooltip ───────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-[14px] py-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] text-[12.5px] min-w-[140px]">
      <p className="font-bold text-foreground mb-[6px]">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-[6px] mb-[3px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Metadados estáticos por aba ───────────────────────────────
const TAB_META: Record<Tab, {
  areaKey:  { main: string; new: string };
  areaName: { main: string; new: string };
  color:    string;
}> = {
  empresas: {
    areaKey:  { main: "total", new: "novas" },
    areaName: { main: "Total", new: "Novas" },
    color:    "#8B5CF6",
  },
  usuarios: {
    areaKey:  { main: "total", new: "novas" },
    areaName: { main: "Total", new: "Novos" },
    color:    "#3B82F6",
  },
  faturamento: {
    areaKey:  { main: "total",         new: "novas"        },
    areaName: { main: "Acumulado (R$)", new: "No mês (R$)" },
    color:    t.success,
  },
};

// ── Componente principal ──────────────────────────────────────
export function AdminChart({ stats }: { stats?: DashboardStats | null }) {
  const [active, setActive] = useState<Tab>("empresas");
  const meta  = TAB_META[active];
  const color = meta.color;

  const tabData = stats?.[active];
  const monthly = tabData?.monthly ?? [];
  const status  = tabData?.status  ?? [];
  const stat    = tabData?.stat    ?? { value: "—", label: "", new: "" };

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.055),0_1px_3px_rgba(0,0,0,0.03)] px-5 pt-[18px] pb-4 flex flex-col flex-1 min-h-0">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 shrink-0">

        {/* Tabs */}
        <div className="flex items-center bg-background rounded-xl p-[3px] gap-0.5">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={cn(
                  "flex items-center gap-[6px] px-3 py-1.5 rounded-lg border-none cursor-pointer text-[12.5px] transition-all duration-150 whitespace-nowrap",
                  isActive
                    ? "font-bold bg-white text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "font-medium bg-transparent text-muted-foreground shadow-none"
                )}
              >
                <span
                  className={cn("flex transition-colors duration-150", isActive ? "" : "text-muted-foreground")}
                  style={isActive ? { color } : undefined}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stat rápido */}
        <div className="text-right">
          <p className="text-[20px] font-extrabold text-foreground m-0 leading-none tracking-[-0.5px]">
            {stat.value}
          </p>
          <p className="text-[11.5px] font-semibold mt-0.5 mb-0" style={{ color }}>
            {stat.new}
          </p>
        </div>
      </div>

      {/* ── Gráficos lado a lado ─────────────────────────── */}
      <div className="grid gap-4 flex-1 min-h-0" style={{ gridTemplateColumns: "1fr 180px" }}>

        {/* Área: evolução */}
        <div className="flex flex-col min-h-0">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em] mb-2 shrink-0">
            Evolução mensal
          </p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={t.primary} stopOpacity={0.14} />
                    <stop offset="95%" stopColor={t.primary} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: t.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: t.textSecondary }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11.5, paddingTop: 6, color: t.textSecondary }} />
                <Area type="monotone" dataKey={meta.areaKey.main} name={meta.areaName.main} stroke={color} strokeWidth={2.5} fill="url(#gradMain)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey={meta.areaKey.new}  name={meta.areaName.new}  stroke={t.primary} strokeWidth={2} fill="url(#gradNew)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: por status */}
        <div className="flex flex-col min-h-0">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em] mb-2 shrink-0">
            Por status
          </p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: t.textSecondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: t.textSecondary }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="qtd" name="Total" radius={[5, 5, 0, 0]} fill={color} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
