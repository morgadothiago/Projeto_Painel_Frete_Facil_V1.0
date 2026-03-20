"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, MapPin, Package } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

type Tab = "motores" | "online" | "entregas";

const TAB_META: Record<Tab, {
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  areaName: string;
}> = {
  motores: {
    label:    "Motoristas",
    icon:     <Users     style={{ width: 13, height: 13 }} />,
    color:    "#0C6B64",
    areaName: "Total",
  },
  online: {
    label:    "Online",
    icon:     <MapPin    style={{ width: 13, height: 13 }} />,
    color:    "#10B981",
    areaName: "Ativos",
  },
  entregas: {
    label:    "Entregas",
    icon:     <Package   style={{ width: 13, height: 13 }} />,
    color:    "#3B82F6",
    areaName: "Feitas",
  },
};

const MOCK_DATA = {
  monthly: [
    { mes: "Jan", total: 45, novas: 12 },
    { mes: "Fev", total: 52, novas: 18 },
    { mes: "Mar", total: 48, novas: 14 },
    { mes: "Abr", total: 61, novas: 22 },
    { mes: "Mai", total: 55, novas: 16 },
    { mes: "Jun", total: 68, novas: 25 },
  ],
  status: [
    { label: "Ativos", qtd: 42 },
    { label: "Ocupados", qtd: 18 },
    { label: "Offline", qtd: 8 },
  ],
};

export function DriverChart() {
  const [active, setActive] = useState<Tab>("motores");
  const meta = TAB_META[active];
  const color = meta.color;

  const monthly = MOCK_DATA.monthly;
  const status = MOCK_DATA.status;

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
          {(["motoristas", "online", "entregas"] as Tab[]).map((key) => {
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
              <AreaChart data={monthly} margin={{ top: 4, right: 8, left: -20, bottom: 24 }}>
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
              <BarChart data={status} margin={{ top: 4, right: 4, left: -16, bottom: 24 }} barSize={28}>
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