"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_BY_ROLE } from "./nav-items";
import { tenantConfig } from "@/config/tenant";
import { signoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type Props = {
  user: {
    name?:  string | null;
    email?: string | null;
    image?: string | null;
    role?:  string;
  };
  collapsed: boolean;
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN:   "Administrador",
  COMPANY: "Empresa",
  DRIVER:  "Motorista",
};

export function Sidebar({ user, collapsed }: Props) {
  const pathname = usePathname();
  const role   = user.role ?? "COMPANY";
  const groups = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.COMPANY;

  const initials = (user.name ?? user.email ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside
      className={cn(
        "relative flex h-screen shrink-0 flex-col overflow-hidden",
        "bg-[linear-gradient(135deg,#2EC4B6,#A8E6CF)]",
        "transition-[width] duration-[240ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[68px]" : "w-[232px]"
      )}
    >

      {/* Círculos decorativos */}
      <div className="pointer-events-none absolute -top-[70px] -right-[70px] h-[220px] w-[220px] rounded-full bg-white/[0.07]" />
      <div className="pointer-events-none absolute bottom-20 -left-[50px] h-[180px] w-[180px] rounded-full bg-white/[0.05]" />

      {/* ── Logo ────────────────────────────────────────── */}
      <div
        className={cn(
          "relative z-[1] flex h-[60px] shrink-0 items-center gap-[10px]",
          "border-b border-white/[0.12]",
          "transition-[padding] duration-[240ms] ease-in-out",
          collapsed ? "justify-center px-0" : "justify-start px-[18px]"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.22] text-[12.5px] font-extrabold text-white backdrop-blur-[8px]">
          {tenantConfig.shortName}
        </div>

        {/* Texto — some com opacity quando colapsado */}
        <div
          className={cn(
            "overflow-hidden whitespace-nowrap transition-opacity duration-150 ease-in-out",
            collapsed ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="text-sm font-extrabold leading-[1.2] text-white">
            {tenantConfig.name}
          </div>
          <div className="mt-0.5 text-[10.5px] text-white/65">
            Painel de controle
          </div>
        </div>
      </div>

      {/* ── Navegação ───────────────────────────────────── */}
      <nav
        className={cn(
          "relative z-[1] flex-1 overflow-y-auto overflow-x-hidden",
          "transition-[padding] duration-[240ms] ease-in-out",
          collapsed ? "px-2 py-[10px]" : "px-[10px] py-[10px]"
        )}
      >
        {groups.map((group, gi) => (
          <div key={gi} className="mb-0.5">

            {/* Label de grupo — some quando colapsado */}
            {group.label && !collapsed && (
              <div className="whitespace-nowrap px-3 pb-[5px] pt-[10px] text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                {group.label}
              </div>
            )}
            {group.label && collapsed && <div className="h-[14px]" />}

            {group.items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "mb-0.5 flex items-center rounded-xl no-underline transition-all duration-150",
                    "text-[13.5px] whitespace-nowrap",
                    collapsed ? "justify-center gap-0 px-0 py-[10px]" : "justify-start gap-[10px] px-3 py-[9px]",
                    isActive
                      ? "bg-white/[0.22] font-bold text-white"
                      : "bg-transparent font-medium text-white/[0.72]"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />

                  <span
                    className={cn(
                      "overflow-hidden transition-opacity duration-150 ease-in-out",
                      collapsed ? "max-w-0 flex-[0] opacity-0" : "max-w-[200px] flex-[1] opacity-100"
                    )}
                  >
                    {item.title}
                  </span>

                  {isActive && !collapsed && (
                    <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-white/[0.85]" />
                  )}
                </Link>
              );
            })}

            {gi < groups.length - 1 && (
              <div className="mx-1 my-[6px] h-px bg-white/[0.12]" />
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        className={cn(
          "relative z-[1] border-t border-white/[0.15]",
          "transition-[padding] duration-[240ms] ease-in-out",
          collapsed ? "px-2 py-3" : "px-[10px] py-3"
        )}
      >
        {collapsed ? (
          /* Modo colapsado: avatar + logout empilhados */
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/25 text-[11px] font-bold text-white">
              {initials}
            </div>
            <form action={signoutAction}>
              <button
                type="submit"
                title="Sair"
                className={cn(
                  "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border-none",
                  "bg-transparent text-white/65 transition-all duration-150",
                  "hover:bg-white/15 hover:text-white"
                )}
              >
                <LogOut className="h-[14px] w-[14px]" />
              </button>
            </form>
          </div>
        ) : (
          /* Modo expandido: avatar + info + logout */
          <div className="flex items-center gap-[10px] rounded-xl bg-black/[0.14] px-3 py-[10px]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-[11.5px] font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] font-semibold text-white">
                {user.name ?? user.email}
              </div>
              <div className="mt-[1px] text-[11px] text-white/60">
                {ROLE_LABEL[role] ?? role}
              </div>
            </div>
            <form action={signoutAction}>
              <button
                type="submit"
                title="Sair"
                className={cn(
                  "flex shrink-0 cursor-pointer items-center rounded-md border-none p-[6px]",
                  "bg-transparent text-white/65 transition-all duration-150",
                  "hover:bg-white/15 hover:text-white"
                )}
              >
                <LogOut className="h-[14px] w-[14px]" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
