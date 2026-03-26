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
import type { DriverDashboardStats } from "@/app/actions/dashboard";

const { theme: t } = tenantConfig;

type Props = { userName: string; stats?: DriverDashboardStats | null };

export function DriverDashboard({ userName, stats }: Props) {
  const isMobile = useIsMobile();

  const overview = stats?.overview;
  const earnings = stats?.earnings;

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
          label="Em Andamento" 
          value={String(overview?.inProgress ?? 0)}
          sub="agora" 
          accent="#F59E0B"
          trend={null}
        />
        <StatCard 
          icon={<Truck />} 
          label="Concluídos" 
          value={String(overview?.completed ?? 0)}
          sub="total" 
          accent={t.primary}
          trend={null}
        />
        <StatCard 
          icon={<CheckCircle2 />} 
          label="Avaliação" 
          value={Number(overview?.rating ?? 0).toFixed(1)}
          sub="★ média" 
          accent={t.success}
          trend={null}
        />
        <StatCard 
          icon={<Wallet />} 
          label="Saldo" 
          value={`R$ ${Number(overview?.balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
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
            <DriverChart stats={stats} />
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
