"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Truck, Package, CheckCircle2, UserCheck, Wifi } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";

type Tab = "fretes" | "entregas" | "performance" | "motoristas_cadastrados" | "motoristas_online";

const TAB_META: Record<Tab, {
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  areaName: string;
}> = {
  fretes: {
    label:    "Fretes",
    icon:     <Truck        style={{ width: 13, height: 13 }} />,
    color:    "#0C6B64",
    areaName: "Total",
  },
  entregas: {
    label:    "Entregas",
    icon:     <Package     style={{ width: 13, height: 13 }} />,
    color:    "#3B82F6",
    areaName: "Feitas",
  },
  performance: {
    label:    "Performance",
    icon:     <CheckCircle2 style={{ width: 13, height: 13 }} />,
    color:    "#10B981",
    areaName: "Taxa",
  },
  motoristas_cadastrados: {
    label:    "Motoristas",
    icon:     <UserCheck    style={{ width: 13, height: 13 }} />,
    color:    "#8B5CF6",
    areaName: "Cadastrados",
  },
  motoristas_online: {
    label:    "Online",
    icon:     <Wifi         style={{ width: 13, height: 13 }} />,
    color:    "#F59E0B",
    areaName: "Ativos",
  },
};

const MOCK_DATA = {
  fretes: {
    monthly: [
      { mes: "Jan", total: 12, novas: 8 },
      { mes: "Fev", total: 18, novas: 14 },
      { mes: "Mar", total: 15, novas: 10 },
      { mes: "Abr", total: 22, novas: 18 },
      { mes: "Mai", total: 28, novas: 20 },
      { mes: "Jun", total: 35, novas: 25 },
    ],
    status: [
      { label: "Ativos", qtd: 8 },
      { label: "Concluídos", qtd: 24 },
      { label: "Cancelados", qtd: 3 },
    ],
  },
  entregas: {
    monthly: [
      { mes: "Jan", total: 45, novas: 30 },
      { mes: "Fev", total: 52, novas: 38 },
      { mes: "Mar", total: 48, novas: 35 },
      { mes: "Abr", total: 61, novas: 45 },
      { mes: "Mai", total: 55, novas: 40 },
      { mes: "Jun", total: 68, novas: 52 },
    ],
    status: [
      { label: "Entregues", qtd: 52 },
      { label: "Em rota", qtd: 12 },
      { label: "Pendentes", qtd: 4 },
    ],
  },
  performance: {
    monthly: [
      { mes: "Jan", total: 85, novas: 5 },
      { mes: "Fev", total: 88, novas: 3 },
      { mes: "Mar", total: 92, novas: 4 },
      { mes: "Abr", total: 90, novas: -2 },
      { mes: "Mai", total: 94, novas: 4 },
      { mes: "Jun", total: 96, novas: 2 },
    ],
    status: [
      { label: "Sucesso", qtd: 85 },
      { label: "Atraso", qtd: 10 },
      { label: "Falha", qtd: 5 },
    ],
  },
  motoristas_cadastrados: {
    monthly: [
      { mes: "Jan", total: 20, novas: 5 },
      { mes: "Fev", total: 24, novas: 4 },
      { mes: "Mar", total: 28, novas: 4 },
      { mes: "Abr", total: 32, novas: 4 },
      { mes: "Mai", total: 38, novas: 6 },
      { mes: "Jun", total: 45, novas: 7 },
    ],
    status: [
      { label: "Ativos", qtd: 30 },
      { label: "Inativos", qtd: 10 },
      { label: "Bloqueados", qtd: 5 },
    ],
  },
  motoristas_online: {
    monthly: [
      { mes: "Jan", total: 8, novas: 2 },
      { mes: "Fev", total: 10, novas: 2 },
      { mes: "Mar", total: 12, novas: 2 },
      { mes: "Abr", total: 15, novas: 3 },
      { mes: "Mai", total: 18, novas: 3 },
      { mes: "Jun", total: 22, novas: 4 },
    ],
    status: [
      { label: "Disponível", qtd: 15 },
      { label: "Ocupado", qtd: 5 },
      { label: "Ausente", qtd: 2 },
    ],
  },
};

export function CompanyChart() {
  const [active, setActive] = useState<Tab>("fretes");
  const meta = TAB_META[active];
  const color = meta.color;

  const monthly = MOCK_DATA[active].monthly;
  const status = MOCK_DATA[active].status;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column",
      flex: 1, minHeight: 260,
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
          {(["fretes", "entregas", "performance", "motoristas_cadastrados", "motoristas_online"] as Tab[]).map((key) => {
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
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.06em",
            margin: "0 0 12px",
          }}>
            Evolução mensal
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-company-${active}`} x1="0" y1="0" x2="0" y2="1">
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
                />
                <YAxis
                  tick={{ fontSize: 10.5, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name={meta.areaName}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#grad-company-${active})`}
                  dot={false}
                  activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.06em",
            margin: "0 0 12px",
          }}>
            Status atual
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={28}>
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