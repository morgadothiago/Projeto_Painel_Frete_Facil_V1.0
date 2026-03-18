"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Building2, UserCircle, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

// ── Dados mock por aba ────────────────────────────────────────
const DATA = {
  empresas: {
    monthly: [
      { mes: "Out", novas: 2,  total: 2  },
      { mes: "Nov", novas: 3,  total: 5  },
      { mes: "Dez", novas: 1,  total: 6  },
      { mes: "Jan", novas: 4,  total: 10 },
      { mes: "Fev", novas: 6,  total: 16 },
      { mes: "Mar", novas: 5,  total: 21 },
    ],
    status: [
      { label: "Ativas",    qtd: 17 },
      { label: "Pendentes", qtd: 3  },
      { label: "Inativas",  qtd: 1  },
    ],
    areaKey:  { main: "total",       new: "novas"       },
    areaName: { main: "Total",       new: "Novas"       },
    color:    "#8B5CF6",
    stat:     { value: "21", label: "empresas cadastradas", new: "+5 este mês" },
  },
  usuarios: {
    monthly: [
      { mes: "Out", novas: 4,  total: 8  },
      { mes: "Nov", novas: 7,  total: 15 },
      { mes: "Dez", novas: 3,  total: 18 },
      { mes: "Jan", novas: 9,  total: 27 },
      { mes: "Fev", novas: 11, total: 38 },
      { mes: "Mar", novas: 8,  total: 46 },
    ],
    status: [
      { label: "Admin",     qtd: 2  },
      { label: "Empresa",   qtd: 21 },
      { label: "Motorista", qtd: 23 },
    ],
    areaKey:  { main: "total",       new: "novas"       },
    areaName: { main: "Total",       new: "Novos"       },
    color:    "#3B82F6",
    stat:     { value: "46", label: "usuários cadastrados", new: "+8 este mês" },
  },
  faturamento: {
    monthly: [
      { mes: "Out", novas: 1200, total: 1200  },
      { mes: "Nov", novas: 2800, total: 4000  },
      { mes: "Dez", novas: 1500, total: 5500  },
      { mes: "Jan", novas: 3200, total: 8700  },
      { mes: "Fev", novas: 4100, total: 12800 },
      { mes: "Mar", novas: 3800, total: 16600 },
    ],
    status: [
      { label: "Pago",      qtd: 14200 },
      { label: "Pendente",  qtd: 1800  },
      { label: "Cancelado", qtd: 600   },
    ],
    areaKey:  { main: "total",         new: "novas"           },
    areaName: { main: "Acumulado (R$)", new: "No mês (R$)"    },
    color:    t.success,
    stat:     { value: "R$ 16.6k", label: "faturamento total", new: "+R$ 3.8k este mês" },
  },
};

type Tab = keyof typeof DATA;

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "empresas",    label: "Empresas",    icon: <Building2  style={{ width: 13, height: 13 }} /> },
  { key: "usuarios",    label: "Usuários",    icon: <UserCircle style={{ width: 13, height: 13 }} /> },
  { key: "faturamento", label: "Faturamento", icon: <Wallet     style={{ width: 13, height: 13 }} /> },
];

// ── Tooltip ───────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusMd,
      padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      fontSize: 12.5, minWidth: 140,
    }}>
      <p style={{ fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: t.textSecondary }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: t.textPrimary }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export function AdminChart() {
  const [active, setActive] = useState<Tab>("empresas");
  const data   = DATA[active];
  const color  = data.color;

  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusLg,
      boxShadow: "0 2px 12px rgba(0,0,0,0.055), 0 1px 3px rgba(0,0,0,0.03)",
      padding: "18px 20px 16px",
      display: "flex", flexDirection: "column",
      flex: 1, minHeight: 0,
    }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexShrink: 0 }}>

        {/* Tabs */}
        <div style={{
          display: "flex", alignItems: "center",
          background: t.background,
          borderRadius: t.radiusMd,
          padding: 3, gap: 2,
        }}>
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8,
                  border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                  background: isActive ? t.surface : "transparent",
                  color: isActive ? t.textPrimary : t.textSecondary,
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: isActive ? color : t.textSecondary, display: "flex", transition: "color 0.15s" }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stat rápido */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: t.textPrimary, margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>
            {data.stat.value}
          </p>
          <p style={{ fontSize: 11.5, color: color, fontWeight: 600, margin: "2px 0 0" }}>
            {data.stat.new}
          </p>
        </div>
      </div>

      {/* ── Gráficos lado a lado ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 16, flex: 1, minHeight: 0 }}>

        {/* Área: evolução */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, flexShrink: 0 }}>
            Evolução mensal
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey={data.areaKey.main} name={data.areaName.main} stroke={color} strokeWidth={2.5} fill="url(#gradMain)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey={data.areaKey.new}  name={data.areaName.new}  stroke={t.primary} strokeWidth={2} fill="url(#gradNew)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras: por status */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: t.textSecondary, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, flexShrink: 0 }}>
            Por status
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.status} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
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
