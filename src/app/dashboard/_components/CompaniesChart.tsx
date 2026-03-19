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

// ── Componente principal ──────────────────────────────────────
export function AdminChart() {
  const [active, setActive] = useState<Tab>("empresas");
  const data   = DATA[active];
  const color  = data.color;

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
            {data.stat.value}
          </p>
          <p className="text-[11.5px] font-semibold mt-0.5 mb-0" style={{ color }}>
            {data.stat.new}
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
        <div className="flex flex-col min-h-0">
          <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.07em] mb-2 shrink-0">
            Por status
          </p>
          <div className="flex-1 min-h-0">
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
