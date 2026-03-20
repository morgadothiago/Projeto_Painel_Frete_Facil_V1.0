"use client";

import { Truck, CheckCircle2, Wallet, PackageSearch, MapPin, Navigation } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { EmptyState }  from "@/components/dashboard/empty-state";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { DriverChart } from "../_components/DriverChart";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type Props = { userName: string };

export function DriverDashboard({ userName }: Props) {
  const isMobile = useIsMobile();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden", minHeight: 0 }}>

      <PageHeader
        label="Motorista"
        title={`Olá, ${userName} 👋`}
        subtitle="Sua operação de hoje"
        actionLabel="Ver Fretes"
        actionHref="/dashboard/disponiveis"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 16, flexShrink: 0 }}>
        <StatCard 
          icon={<PackageSearch />} 
          label="Disponíveis" 
          value="0" 
          sub="para aceitar" 
          accent="#F59E0B"
          trend={null}
        />
        <StatCard 
          icon={<Truck />} 
          label="Em Andamento" 
          value="0" 
          sub="agora" 
          accent={t.primary}
          trend={null}
        />
        <StatCard 
          icon={<CheckCircle2 />} 
          label="Concluídos" 
          value="0" 
          sub="este mês" 
          accent={t.success}
          trend={{ value: 12, isPositive: true }}
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
        gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
        gap: 14,
        flex: isMobile ? "none" : 1,
        minHeight: 0,
        overflow: isMobile ? "visible" : "hidden",
      }}>

        {/* Gráfico */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <DriverChart />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
          <Card title="Ações rápidas">
            <div style={{ padding: "8px" }}>
              <QuickAction icon={<PackageSearch />} label="Fretes Disponíveis" sub="Aceitar uma entrega"     href="/dashboard/disponiveis"  color="#F59E0B" />
              <QuickAction icon={<MapPin />}        label="Em Andamento"       sub="Ver rota atual"         href="/dashboard/em-andamento" color={t.primary} />
              <QuickAction icon={<Wallet />}        label="Meu Saldo"          sub="Ganhos e saques"        href="/dashboard/saldo"        color={t.success} />
            </div>
          </Card>

          <InfoCard
            icon={<Navigation style={{ width: 15, height: 15 }} />}
            title="Navegação integrada"
            description="Receba rotas otimizadas e atualizações em tempo real direto no app."
            linkLabel="Ver fretes"
            linkHref="/dashboard/disponiveis"
          />
        </div>
      </div>

    </div>
  );
}
