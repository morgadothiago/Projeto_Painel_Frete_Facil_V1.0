"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/app/context/TenantContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { name } = useTenant();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-muted)" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 shadow-soft"
        style={{ background: "var(--color-primary)" }}
      >
        <h1 className="text-xl font-bold text-white">{name}</h1>
        <button onClick={logout} className="btn-outline text-white border-white hover:bg-white hover:text-primary text-sm px-4 py-2">
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Bem-vindo de volta</p>
          <h2 className="text-2xl font-bold mt-1" style={{ color: "var(--color-foreground)" }}>
            {user?.name ?? user?.email}
          </h2>
          <span className="badge-primary mt-2 capitalize">{user?.role ?? "usuário"}</span>
        </div>

        {/* Cards de ação (exemplo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
              <svg className="w-6 h-6" style={{ color: "var(--color-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-foreground)" }}>Fretes</p>
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Gerenciar entregas</p>
            </div>
          </div>

          <div className="card flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FFF8E1" }}>
              <svg className="w-6 h-6" style={{ color: "#FFD600" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-foreground)" }}>Financeiro</p>
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Pagamentos e saldo</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
