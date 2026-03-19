import {
  Building2, Truck, TrendingUp,
  Settings, UserCircle, BarChart3,
  CheckCircle2, Wallet,
} from "lucide-react";

import { PageHeader }  from "@/components/dashboard/page-header";
import { StatCard }    from "@/components/dashboard/stat-card";
import { Card }        from "@/components/dashboard/card";
import { InfoCard }    from "@/components/dashboard/info-card";
import { QuickAction } from "../_components/QuickAction";
import { AdminChart }  from "../_components/CompaniesChart";
import { getDashboardStats } from "@/app/actions/dashboard";

type Props = { userName: string };

export async function AdminDashboard({ userName }: Props) {
  const stats = await getDashboardStats();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, overflow: "hidden", minHeight: 0 }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <PageHeader
        label="Painel Administrativo"
        title={`Olá, ${userName} 👋`}
        subtitle="Visão geral da plataforma FreteFácil"
        actionLabel="Ver Relatórios"
        actionHref="/dashboard/faturamento"
      />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, flexShrink: 0 }}>
        <StatCard
          icon={<Building2 />}
          label="Empresas"
          value={stats?.empresas.stat.value ?? "0"}
          sub="cadastradas"
          accent="#0C6B64"
        />
        <StatCard
          icon={<Truck />}
          label="Fretes"
          value="0"
          sub="na plataforma"
          accent="#3B82F6"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Receita"
          value="R$ 0"
          sub="este mês"
          accent="#059669"
        />
      </div>

      {/* ── Corpo ───────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 260px",
        gap: 14,
        flex: 1, minHeight: 0,
        overflow: "hidden",
      }}>

        {/* Gráfico */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <AdminChart stats={stats} />
        </div>

        {/* Coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "auto" }}>

          <Card title="Gestão">
            <div style={{ padding: "6px 6px" }}>
              <QuickAction icon={<Building2 />}  label="Empresas"      sub="Gerenciar cadastros"     href="/dashboard/empresas"      color="#0C6B64" />
              <QuickAction icon={<Wallet />}      label="Faturamento"   sub="Receitas e cobranças"    href="/dashboard/faturamento"   color="#059669" />
              <QuickAction icon={<UserCircle />}  label="Usuários"      sub="Controle de acesso"      href="/dashboard/usuarios"      color="#3B82F6" />
              <QuickAction icon={<BarChart3 />}   label="Relatórios"    sub="Métricas da plataforma"  href="/dashboard/relatorios"    color="#8B5CF6" />
              <QuickAction icon={<Settings />}    label="Configurações" sub="Parâmetros do sistema"   href="/dashboard/configuracoes" color="#64748B" />
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
