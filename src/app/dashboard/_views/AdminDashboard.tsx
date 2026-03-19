import {
  Building2, Truck, TrendingUp,
  Settings, UserCircle, BarChart3, CheckCircle2,
} from "lucide-react";
import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { AdminChart }  from "../_components/CompaniesChart";

type Props = { userName: string };

export function AdminDashboard({ userName }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0">
      <PageHeader
        label="Painel Administrativo"
        title={`Olá, ${userName} 👋`}
        subtitle="Visão geral da plataforma FreteFácil"
        actionLabel="Ver Relatórios"
        actionHref="/dashboard/relatorios"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
        <StatCard icon={<Building2 />} label="Empresas"  value="21"   sub="cadastradas"   accent="#8B5CF6" />
        <StatCard icon={<Truck />}     label="Fretes"    value="0"    sub="na plataforma"  accent="#2EC4B6" />
        <StatCard icon={<TrendingUp />} label="Receita"  value="R$ 0" sub="este mês"       accent="#10B981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 flex-1 min-h-0">
        <AdminChart />

        <div className="flex flex-col gap-3">
          <Card title="Gestão">
            <div className="p-2">
              <QuickAction icon={<Building2 />}  label="Empresas"      sub="Gerenciar cadastros"    href="/dashboard/empresas"       color="#8B5CF6" />
              <QuickAction icon={<UserCircle />}  label="Usuários"      sub="Controle de acesso"    href="/dashboard/usuarios"       color="#2EC4B6" />
              <QuickAction icon={<BarChart3 />}   label="Relatórios"    sub="Faturamento e métricas" href="/dashboard/relatorios"    color="#10B981" />
              <QuickAction icon={<Settings />}    label="Configurações" sub="Parâmetros do sistema" href="/dashboard/configuracoes"  color="#64748B" />
            </div>
          </Card>

          <InfoCard
            icon={<CheckCircle2 className="w-[15px] h-[15px]" />}
            title="Sistema operacional"
            description="Todos os serviços estão online e funcionando normalmente."
            linkLabel="Ver logs"
            linkHref="/dashboard/configuracoes"
          />
        </div>
      </div>
    </div>
  );
}
