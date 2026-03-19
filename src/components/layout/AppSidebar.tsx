"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_BY_ROLE } from "./nav-items";
import { tenantConfig } from "@/config/tenant";
import { cn } from "@/lib/utils";

type Props = {
  user: {
    name?:  string | null;
    email?: string | null;
    image?: string | null;
    role?:  string;
  };
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN:   "Administrador",
  COMPANY: "Empresa",
  DRIVER:  "Motorista",
};

const ROLE_STYLE: Record<string, { bg: string; text: string }> = {
  ADMIN:   { bg: "bg-[#ede9fe]", text: "text-[#7c3aed]" },
  COMPANY: { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]" },
  DRIVER:  { bg: "bg-[#ccfbf1]", text: "text-[#0d9488]" },
};

export function AppSidebar({ user }: Props) {
  const pathname = usePathname();
  const role     = user.role ?? "COMPANY";
  const groups   = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.COMPANY;
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleStyle = ROLE_STYLE[role] ?? ROLE_STYLE.COMPANY;

  return (
    <Sidebar collapsible="icon">

      {/* ── Logo ──────────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow">
            {tenantConfig.shortName}
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold leading-tight text-primary">
              {tenantConfig.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Painel de controle
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Navegação ─────────────────────────────────────────── */}
      <SidebarContent className="py-3">
        {groups.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.label && (
              <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className="mx-1 my-0.5 rounded-xl"
                      render={
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5",
                            isActive
                              ? "bg-primary-light text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {isActive && (
                            <ChevronRight className="h-3 w-3 shrink-0 text-primary group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {gi < groups.length - 1 && (
              <SidebarSeparator className="mx-3 mt-2 bg-[#F3F4F6]" />
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer ────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-[#F9FAFB] p-2.5 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-primary text-xs font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.name ?? user.email}
            </span>
            <span
              className={cn(
                "mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold",
                roleStyle.bg,
                roleStyle.text
              )}
            >
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>

          <button
            onClick={() => signOut({ redirectTo: "/" })}
            className={cn(
              "ml-auto shrink-0 rounded-xl p-1.5 text-muted-foreground transition-colors",
              "group-data-[collapsible=icon]:hidden",
              "hover:bg-red-100 hover:text-red-600"
            )}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>

    </Sidebar>
  );
}
