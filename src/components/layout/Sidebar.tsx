"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_BY_ROLE } from "./nav-items";
import { tenantConfig } from "@/config/tenant";
import { signoutAction } from "@/app/actions/auth";

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
  const { theme: t } = tenantConfig;
  const role   = user.role ?? "COMPANY";
  const groups = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.COMPANY;

  const initials = (user.name ?? user.email ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const W = collapsed ? 68 : 232;

  return (
    <aside style={{
      width: W,
      height: "100vh",
      background: t.gradientPrimary,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      transition: "width 0.24s cubic-bezier(0.4,0,0.2,1)",
      position: "relative",
    }}>

      {/* Círculos decorativos */}
      <div style={{
        position: "absolute", top: -70, right: -70,
        width: 220, height: 220, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 80, left: -50,
        width: 180, height: 180, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)", pointerEvents: "none",
      }} />

      {/* ── Logo ────────────────────────────────────────── */}
      <div style={{
        height: 60, display: "flex", alignItems: "center",
        padding: collapsed ? "0" : "0 18px",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 10, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        position: "relative", zIndex: 1,
        transition: "padding 0.24s ease",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: t.radiusMd,
          background: "rgba(255,255,255,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 12.5,
          flexShrink: 0, backdropFilter: "blur(8px)",
        }}>
          {tenantConfig.shortName}
        </div>

        {/* Texto — some com opacity quando colapsado */}
        <div style={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.15s ease",
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            {tenantConfig.name}
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
            Painel de controle
          </div>
        </div>
      </div>

      {/* ── Navegação ───────────────────────────────────── */}
      <nav style={{
        flex: 1,
        padding: collapsed ? "10px 8px" : "10px 10px",
        overflowY: "auto", overflowX: "hidden",
        position: "relative", zIndex: 1,
        transition: "padding 0.24s ease",
      }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 2 }}>

            {/* Label de grupo — some quando colapsado */}
            {group.label && !collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                padding: "10px 12px 5px", whiteSpace: "nowrap",
              }}>
                {group.label}
              </div>
            )}
            {group.label && collapsed && <div style={{ height: 14 }} />}

            {group.items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.title : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: collapsed ? 0 : 10,
                    padding: collapsed ? "10px 0" : "9px 12px",
                    borderRadius: t.radiusMd, marginBottom: 2,
                    textDecoration: "none", transition: "all 0.15s",
                    background: isActive ? "rgba(255,255,255,0.22)" : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />

                  <span style={{
                    opacity: collapsed ? 0 : 1,
                    flex: collapsed ? 0 : 1,
                    overflow: "hidden",
                    transition: "opacity 0.15s ease",
                    maxWidth: collapsed ? 0 : 200,
                  }}>
                    {item.title}
                  </span>

                  {isActive && !collapsed && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "rgba(255,255,255,0.85)", flexShrink: 0,
                    }} />
                  )}
                </Link>
              );
            })}

            {gi < groups.length - 1 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "6px 4px" }} />
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? "12px 8px" : "12px 10px",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        position: "relative", zIndex: 1,
        transition: "padding 0.24s ease",
      }}>
        {collapsed ? (
          /* Modo colapsado: avatar + logout empilhados */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 700,
            }}>
              {initials}
            </div>
            <form action={signoutAction}>
              <button
                type="submit"
                title="Sair"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  width: 30, height: 30, borderRadius: t.radiusSm,
                  color: "rgba(255,255,255,0.65)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  e.currentTarget.style.background = "none";
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </form>
          </div>
        ) : (
          /* Modo expandido: avatar + info + logout */
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.14)", borderRadius: t.radiusMd,
            padding: "10px 12px",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11.5, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user.name ?? user.email}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                {ROLE_LABEL[role] ?? role}
              </div>
            </div>
            <form action={signoutAction}>
              <button
                type="submit"
                title="Sair"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 6, borderRadius: t.radiusSm,
                  color: "rgba(255,255,255,0.65)",
                  display: "flex", alignItems: "center", flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  e.currentTarget.style.background = "none";
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
