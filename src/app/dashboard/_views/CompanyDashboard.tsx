"use client";

import { Truck, CheckCircle2, Wallet, Clock, MapPin } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { EmptyState }  from "@/components/dashboard/empty-state";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { CompanyChart } from "../_components/CompanyChart";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type Props = { userName: string };

function TruckIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" style={{ width: 44, height: 44 }}>
      <rect x="4"  y="18" width="36" height="28" rx="5" fill={t.primary} opacity=".2" />
      <rect x="6"  y="20" width="32" height="24" rx="4" fill={t.primary} opacity=".35" />
      <rect x="10" y="23" width="14" height="10" rx="2" fill={t.primary} />
      <path d="M40 26h12l8 10v10H40V26z" fill={t.primary} opacity=".5" />
      <rect x="42" y="29" width="10" height="7" rx="1.5" fill={t.primary} />
      <circle cx="18" cy="48" r="7" fill={t.primaryDark} opacity=".25" />
      <circle cx="18" cy="48" r="4" fill={t.primary} />
      <circle cx="18" cy="48" r="2" fill="white" />
      <circle cx="52" cy="48" r="7" fill={t.primaryDark} opacity=".25" />
      <circle cx="52" cy="48" r="4" fill={t.primary} />
      <circle cx="52" cy="48" r="2" fill="white" />
    </svg>
  );
}

export function CompanyDashboard({ userName }: Props) {
  const isMobile = useIsMobile();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden", minHeight: 0 }}>

      <PageHeader
        label="Empresa"
        title={`Olá, ${userName} 👋`}
        subtitle="Resumo da sua operação hoje"
        actionLabel="Novo Frete"
        actionHref="/dashboard/fretes"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, flexShrink: 0 }}>
        <StatCard 
          icon={<Truck />} 
          label="Fretes Ativos" 
          value="0" 
          sub="em andamento" 
          accent={t.primary}
          trend={null}
        />
        <StatCard 
          icon={<CheckCircle2 />} 
          label="Concluídos" 
          value="0" 
          sub="este mês" 
          accent={t.success}
          trend={null}
        />
        <StatCard 
          icon={<Clock />} 
          label="Aguardando" 
          value="0" 
          sub="pendentes" 
          accent={t.warning}
          trend={null}
        />
        <StatCard 
          icon={<Wallet />} 
          label="Saldo" 
          value="R$ 0" 
          sub="disponível" 
          accent="#6366F1"
          trend={null}
        />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
        gap: 14,
        flex: isMobile ? "none" : 1,
        minHeight: 0,
        overflow: "auto",
      }}>

        {/* Gráfico */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 300 }}>
          <CompanyChart />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
          <Card title="Ações rápidas">
            <div style={{ padding: "8px" }}>
              <QuickAction icon={<Truck />}  label="Novo Frete"    sub="Criar uma entrega"     href="/dashboard/fretes"     color={t.primary} />
              <QuickAction icon={<MapPin />} label="Simular Frete" sub="Calcular preço e rota" href="/dashboard/simular"    color="#6366F1" />
              <QuickAction icon={<Wallet />} label="Financeiro"    sub="Saldo e faturamento"   href="/dashboard/financeiro" color={t.success} />
            </div>
          </Card>

          <InfoCard
            icon={<MapPin style={{ width: 15, height: 15 }} />}
            title="Rastreamento GPS"
            description="Acompanhe seus fretes em tempo real com notificações automáticas."
            linkLabel="Saiba mais"
            linkHref="/dashboard/rastrear"
          />
        </div>
      </div>

    </div>
  );
}
