import {
  Building2, Truck, TrendingUp,
  Settings, UserCircle, BarChart3,
  CheckCircle2,
} from "lucide-react";

import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { AdminChart }  from "../_components/CompaniesChart";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type Props = { userName: string };

export function AdminDashboard({ userName }: Props) {
  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">

      {/* ── Banner ───────────────────────────────────────── */}
      <PageHeader
        label="Painel Administrativo"
        title={`Olá, ${userName} 👋`}
        subtitle="Visão geral da plataforma FreteFácil"
        actionLabel="Ver Relatórios"
        actionHref="/dashboard/relatorios"
      />

      {/* ── Métricas ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <StatCard icon={<Building2 />}  label="Empresas"  value="21"     sub="cadastradas"    accent="#8B5CF6" />
        <StatCard icon={<Truck />}      label="Fretes"    value="0"      sub="na plataforma"  accent={t.primary} />
        <StatCard icon={<TrendingUp />} label="Receita"   value="R$ 0"   sub="este mês"       accent={t.success} />
      </div>

      {/* ── Corpo ────────────────────────────────────────── */}
      <div className="grid gap-[14px] flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: "1fr 280px" }}>

        {/* Coluna principal: gráfico com tabs */}
        <div className="flex flex-col gap-[14px] overflow-hidden min-h-0">
          <AdminChart />
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-3 overflow-hidden min-h-0">

          <Card title="Gestão">
            <div className="p-2">
              <QuickAction
                icon={<Building2 />}
                label="Empresas"
                sub="Gerenciar cadastros"
                href="/dashboard/empresas"
                color="#8B5CF6"
              />
              <QuickAction
                icon={<UserCircle />}
                label="Usuários"
                sub="Controle de acesso"
                href="/dashboard/usuarios"
                color={t.primary}
              />
              <QuickAction
                icon={<BarChart3 />}
                label="Relatórios"
                sub="Faturamento e métricas"
                href="/dashboard/relatorios"
                color={t.success}
              />
              <QuickAction
                icon={<Settings />}
                label="Configurações"
                sub="Parâmetros do sistema"
                href="/dashboard/configuracoes"
                color={t.textSecondary}
              />
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
