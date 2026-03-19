"use client";

import {
  Building2, Truck, TrendingUp,
  Settings, UserCircle, BarChart3,
  CheckCircle2,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden", minHeight: 0 }}>

      {/* ── Banner ───────────────────────────────────────── */}
      <PageHeader
        label="Painel Administrativo"
        title={`Olá, ${userName} 👋`}
        subtitle="Visão geral da plataforma FreteFácil"
        actionLabel="Ver Relatórios"
        actionHref="/dashboard/relatorios"
      />

      {/* ── Métricas ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, flexShrink: 0 }}>
        <StatCard icon={<Building2 />}  label="Empresas"  value="21"     sub="cadastradas"    accent="#8B5CF6" />
        <StatCard icon={<Truck />}      label="Fretes"    value="0"      sub="na plataforma"  accent={t.primary} />
        <StatCard icon={<TrendingUp />} label="Receita"   value="R$ 0"   sub="este mês"       accent={t.success} />
      </div>

      {/* ── Corpo ────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
        gap: 14,
        flex: isMobile ? "none" : 1,
        minHeight: 0,
        overflow: isMobile ? "visible" : "hidden",
      }}>

        {/* Coluna principal: gráfico com tabs */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          overflow: "hidden", minHeight: isMobile ? 320 : 0,
        }}>
          <AdminChart />
        </div>

        {/* Coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>

          <Card title="Gestão">
            <div style={{ padding: "8px" }}>
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
            icon={<CheckCircle2 style={{ width: 15, height: 15 }} />}
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
