"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Package, TrendingUp } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";
import type { DriverDashboardStats } from "@/app/actions/dashboard";

type Tab = "entregas" | "ganhos" | "performance";

const TAB_META: Record<Tab, {
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  areaName: string;
}> = {
  entregas: {
    label:    "Entregas",
    icon:     <Package    style={{ width: 13, height: 13 }} />,
    color:    "#0C6B64",
    areaName: "Total",
  },
  ganhos: {
    label:    "Ganhos",
    icon:     <DollarSign style={{ width: 13, height: 13 }} />,
    color:    "#10B981",
    areaName: "R$",
  },
  performance: {
    label:    "Performance",
    icon:     <TrendingUp style={{ width: 13, height: 13 }} />,
    color:    "#3B82F6",
    areaName: "Taxa",
  },
};

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function buildMonthlyFromEarnings(
  daily: Array<{ date: string; total: number }>,
): Array<{ mes: string; total: number; novas: number }> {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()] };
  });

  const windowStart = new Date(months[0].year, months[0].month, 1);
  const sums: Record<string, number> = {};
  months.forEach(m => (sums[`${m.year}-${m.month}`] = 0));

  let totalBefore = 0;
  for (const entry of daily) {
    const dt = new Date(entry.date);
    if (dt < windowStart) {
      totalBefore += entry.total;
    } else {
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (key in sums) sums[key] += entry.total;
    }
  }

  let running = totalBefore;
  return months.map(m => {
    const novas = Math.round(sums[`${m.year}-${m.month}`] ?? 0);
    running += novas;
    return { mes: m.label, novas, total: Math.round(running) };
  });
}

type Props = { stats?: DriverDashboardStats | null };

export function DriverChart({ stats }: Props) {
  const [active, setActive] = useState<Tab>("entregas");
  const meta = TAB_META[active];
  const color = meta.color;

  const overview = stats?.overview;
  const earnings = stats?.earnings;
  const earningsMonthly = useMemo(
    () => buildMonthlyFromEarnings(stats?.earningsLast30Days ?? []),
    [stats],
  );

  const chartData = useMemo(() => {
    if (active === "entregas") {
      // Simplified monthly data from overview
      const completed = overview?.completed ?? 0;
      const cancelled = overview?.cancelled ?? 0;
      const total = completed + cancelled + (overview?.inProgress ?? 0);
      return {
        monthly: earningsMonthly.length > 0 ? earningsMonthly : [{ mes: "Atual", total, novas: completed }],
        status: [
          { label: "Concluídas", qtd: completed },
          { label: "Em Curso", qtd: overview?.inProgress ?? 0 },
          { label: "Canceladas", qtd: cancelled },
        ],
      };
    }
    if (active === "ganhos") {
      return {
        monthly: earningsMonthly,
        status: [
          { label: "Pago", qtd: Math.round(earnings?.totalPaid ?? 0) },
          { label: "Bruto", qtd: Math.round(earnings?.totalGross ?? 0) },
        ],
      };
    }
    // performance
    const totalDel = overview?.totalDeliveries ?? 0;
    const rating = overview?.rating ?? 0;
    return {
      monthly: earningsMonthly,
      status: [
        { label: "Entregas", qtd: totalDel },
        { label: "Rating", qtd: Math.round(rating * 20) }, // scale 0-5 to 0-100
      ],
    };
  }, [active, earningsMonthly, overview, earnings]);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      flex: 1, height: 360,
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px 14px",
        borderBottom: "1px solid #F1F5F9",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          background: "#F8FAFC",
          borderRadius: 10,
          padding: 4,
          gap: 2,
        }}>
          {(["entregas", "ganhos", "performance"] as Tab[]).map((key) => {
            const m = TAB_META[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#0F172A" : "#94A3B8",
                  background: isActive ? "#fff" : "transparent",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
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
      </div>

      {/* Gráficos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 160px",
        gap: 20,
        flex: 1, minHeight: 0,
        padding: "16px 20px 14px",
      }}>

        {/* Área */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.06em",
            margin: "0 0 12px",
          }}>
            Evolução mensal
          </p>
          <div style={{ height: 240, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthly} margin={{ top: 4, right: 8, left: -20, bottom: 24 }}>
                <defs>
                  <linearGradient id={`grad-driver-${active}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
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
                  dataKey="total"
                  name={meta.areaName}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#grad-driver-${active})`}
                  dot={false}
                  activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.06em",
            margin: "0 0 12px",
          }}>
            Status atual
          </p>
          <div style={{ height: 240, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.status} margin={{ top: 4, right: 4, left: -16, bottom: 24 }} barSize={28}>
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
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11, color: "#94A3B8" }} />
                <Bar
                  dataKey="qtd"
                  name="Total"
                  radius={[6, 6, 0, 0]}
                  fill={color}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}