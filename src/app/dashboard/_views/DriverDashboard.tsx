import { Truck, CheckCircle2, Wallet, PackageSearch, MapPin, Navigation } from "lucide-react";

import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { EmptyState }  from "@/components/dashboard/empty-state";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type Props = { userName: string };

export function DriverDashboard({ userName }: Props) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden", minHeight: 0 }}>

      <PageHeader
        label="Motorista"
        title={`Olá, ${userName} 👋`}
        subtitle="Sua operação de hoje"
        actionLabel="Ver Fretes"
        actionHref="/dashboard/disponiveis"
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flexShrink: 0 }}>
        <StatCard icon={<PackageSearch />} label="Disponíveis"  value="0"    sub="para aceitar"  accent="#F59E0B" />
        <StatCard icon={<Truck />}         label="Em Andamento" value="0"    sub="agora"         accent={t.primary} />
        <StatCard icon={<CheckCircle2 />}  label="Concluídos"  value="0"    sub="este mês"      accent={t.success} />
        <StatCard icon={<Wallet />}        label="Saldo"        value="R$ 0" sub="disponível"    accent="#6366F1" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, flex: 1, minHeight: 0, overflow: "hidden" }}>

        <Card
          title="Meus Fretes"
          icon={<Truck style={{ width: 15, height: 15 }} />}
          href="/dashboard/fretes"
          fill
        >
          <EmptyState
            icon={
              <svg viewBox="0 0 64 64" fill="none" style={{ width: 44, height: 44 }}>
                <circle cx="32" cy="24" r="14" fill={t.primary} opacity=".15" />
                <circle cx="32" cy="24" r="8" fill={t.primary} opacity=".35" />
                <circle cx="32" cy="24" r="4" fill={t.primary} />
                <path d="M32 38 L32 56" stroke={t.primary} strokeWidth="3" strokeLinecap="round" />
                <circle cx="32" cy="56" r="3" fill={t.primary} opacity=".4" />
              </svg>
            }
            title="Nenhum frete ativo"
            subtitle="Aceite um frete disponível para começar"
            actionLabel="Ver disponíveis"
            actionHref="/dashboard/disponiveis"
          />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", minHeight: 0 }}>
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
