"use client";

import { useState } from "react";
import { PanelLeft, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";

type User = {
  name?:  string | null;
  email?: string | null;
  image?: string | null;
  role?:  string;
};

type Props = {
  user:     User;
  initials: string;
  children: React.ReactNode;
};

export function DashboardShell({ user, initials, children }: Props) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,  setMobileOpen]   = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Overlay mobile ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      {/* Desktop: relative (normal flow). Mobile: fixed drawer */}
      <div className={cn(
        /* desktop */
        "hidden lg:flex shrink-0",
        /* mobile drawer */
        "lg:relative fixed inset-y-0 left-0 z-50 flex transition-transform duration-[240ms] ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar user={user} collapsed={collapsed} onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* ── Header ──────────────────────────────────────── */}
        <header className="flex h-[60px] shrink-0 items-center gap-2 bg-white px-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">

          {/* Toggle sidebar */}
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen((v) => !v);
              else setCollapsed((c) => !c);
            }}
            title="Menu"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-none bg-transparent",
              "cursor-pointer text-muted-foreground transition-[background,color] duration-150",
              "hover:bg-background hover:text-primary"
            )}
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>

          {/* Busca — some em mobile muito pequeno */}
          <div className="hidden sm:flex max-w-[300px] flex-1 cursor-text items-center gap-2 rounded-xl bg-background px-[14px] py-[7px]">
            <Search className="h-[13px] w-[13px] shrink-0 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">Buscar…</span>
          </div>

          <div className="flex-1" />

          {/* Status online — some em telas muito pequenas */}
          <div className="hidden sm:flex items-center gap-[6px] text-xs font-medium text-muted-foreground">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(76,175,80,0.145)]" />
            Online
          </div>

          {/* Notificações */}
          <NotificationBell />

          {/* Divisor */}
          <div className="h-5 w-px shrink-0 bg-border" />

          {/* Avatar + nome */}
          <div
            className={cn(
              "flex cursor-pointer items-center gap-[9px] rounded-xl px-[6px] py-1",
              "transition-[background] duration-150 hover:bg-background"
            )}
          >
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2EC4B6,#A8E6CF)] text-[11px] font-bold text-white">
              {initials}
            </div>
            <span className="hidden md:block whitespace-nowrap text-[13px] font-semibold text-foreground">
              {user.name?.split(" ")[0] ?? user.email}
            </span>
          </div>

        </header>

        {/* ── Conteúdo ─────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-5 sm:px-6">
          {children}
        </main>

      </div>
    </div>
  );
}
