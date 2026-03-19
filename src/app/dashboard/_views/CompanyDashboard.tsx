import { Truck, CheckCircle2, Wallet, Clock, MapPin } from "lucide-react";
import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { EmptyState }  from "@/components/dashboard/empty-state";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";

type Props = { userName: string };

function TruckIllustration() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-[44px] w-[44px]">
      <rect x="4"  y="18" width="36" height="28" rx="5" fill="#2EC4B6" opacity=".2" />
      <rect x="6"  y="20" width="32" height="24" rx="4" fill="#2EC4B6" opacity=".35" />
      <rect x="10" y="23" width="14" height="10" rx="2" fill="#2EC4B6" />
      <path d="M40 26h12l8 10v10H40V26z" fill="#2EC4B6" opacity=".5" />
      <rect x="42" y="29" width="10" height="7" rx="1.5" fill="#2EC4B6" />
      <circle cx="18" cy="48" r="7" fill="#1FA7A1" opacity=".25" />
      <circle cx="18" cy="48" r="4" fill="#2EC4B6" />
      <circle cx="18" cy="48" r="2" fill="white" />
      <circle cx="52" cy="48" r="7" fill="#1FA7A1" opacity=".25" />
      <circle cx="52" cy="48" r="4" fill="#2EC4B6" />
      <circle cx="52" cy="48" r="2" fill="white" />
    </svg>
  );
}

export function CompanyDashboard({ userName }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0">
      <PageHeader
        label="Empresa"
        title={`Olá, ${userName} 👋`}
        subtitle="Resumo da sua operação hoje"
        actionLabel="Novo Frete"
        actionHref="/dashboard/fretes"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <StatCard icon={<Truck />}        label="Fretes Ativos" value="0"    sub="em andamento" accent="#2EC4B6" />
        <StatCard icon={<CheckCircle2 />} label="Concluídos"   value="0"    sub="este mês"     accent="#10B981" />
        <StatCard icon={<Clock />}        label="Aguardando"   value="0"    sub="pendentes"    accent="#F59E0B" />
        <StatCard icon={<Wallet />}       label="Saldo"        value="R$ 0" sub="disponível"   accent="#6366F1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 flex-1 min-h-0">
        <Card title="Fretes Recentes" icon={<Truck className="w-[15px] h-[15px]" />} href="/dashboard/fretes" fill>
          <EmptyState
            icon={<TruckIllustration />}
            title="Nenhum frete cadastrado"
            subtitle="Crie seu primeiro frete e comece a operar"
            actionLabel="Criar frete"
            actionHref="/dashboard/fretes"
          />
        </Card>

        <div className="flex flex-col gap-3">
          <Card title="Ações rápidas">
            <div className="p-2">
              <QuickAction icon={<Truck />}  label="Novo Frete"    sub="Criar uma entrega"     href="/dashboard/fretes"     color="#2EC4B6" />
              <QuickAction icon={<MapPin />} label="Simular Frete" sub="Calcular preço e rota" href="/dashboard/simular"    color="#6366F1" />
              <QuickAction icon={<Wallet />} label="Financeiro"    sub="Saldo e faturamento"   href="/dashboard/financeiro" color="#10B981" />
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
