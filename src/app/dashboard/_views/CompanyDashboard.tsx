import { Truck, CheckCircle2, Wallet, Clock, MapPin } from "lucide-react";

import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { EmptyState }  from "@/components/dashboard/empty-state";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type Props = { userName: string };

function TruckIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-[44px] h-[44px]">
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
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">

      <PageHeader
        label="Empresa"
        title={`Olá, ${userName} 👋`}
        subtitle="Resumo da sua operação hoje"
        actionLabel="Novo Frete"
        actionHref="/dashboard/fretes"
      />

      <div className="grid grid-cols-4 gap-3 shrink-0">
        <StatCard icon={<Truck />}        label="Fretes Ativos" value="0"    sub="em andamento" accent={t.primary} />
        <StatCard icon={<CheckCircle2 />} label="Concluídos"   value="0"    sub="este mês"     accent={t.success} />
        <StatCard icon={<Clock />}        label="Aguardando"   value="0"    sub="pendentes"    accent={t.warning} />
        <StatCard icon={<Wallet />}       label="Saldo"        value="R$ 0" sub="disponível"   accent="#6366F1"   />
      </div>

      <div className="grid gap-[14px] flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: "1fr 280px" }}>

        <Card
          title="Fretes Recentes"
          icon={<Truck className="w-[15px] h-[15px]" />}
          href="/dashboard/fretes"
          fill
        >
          <EmptyState
            icon={<TruckIllustration />}
            title="Nenhum frete cadastrado"
            subtitle="Crie seu primeiro frete e comece a operar"
            actionLabel="Criar frete"
            actionHref="/dashboard/fretes"
          />
        </Card>

        <div className="flex flex-col gap-3 overflow-hidden min-h-0">
          <Card title="Ações rápidas">
            <div className="p-2">
              <QuickAction icon={<Truck />}  label="Novo Frete"    sub="Criar uma entrega"     href="/dashboard/fretes"     color={t.primary} />
              <QuickAction icon={<MapPin />} label="Simular Frete" sub="Calcular preço e rota" href="/dashboard/simular"    color="#6366F1" />
              <QuickAction icon={<Wallet />} label="Financeiro"    sub="Saldo e faturamento"   href="/dashboard/financeiro" color={t.success} />
            </div>
          </Card>

          <InfoCard
            icon={<MapPin className="w-[15px] h-[15px]" />}
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
