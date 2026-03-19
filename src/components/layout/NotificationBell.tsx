"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, Building2, CheckCheck, Loader2, BellOff, Sparkles } from "lucide-react";
import { tenantConfig } from "@/config/tenant";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getNotifications,
  markAllAsRead,
  activateCompany,
  type AppNotification,
} from "@/app/actions/notifications";

const { theme: t } = tenantConfig;

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

// ── Item ─────────────────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  activated,
  activatingId,
  onActivate,
}: {
  notification: AppNotification;
  activated:    Set<string>;
  activatingId: string | null;
  onActivate:   (userId: string, notifId: string) => void;
}) {
  const isPending = notification.type === "COMPANY_PENDING";
  const data      = notification.data ? JSON.parse(notification.data) : {};
  const isLoading = activatingId === notification.id;
  const isDone    = activated.has(notification.id);
  const isUnread  = !notification.read && !isDone;

  return (
    <div style={{
      padding: "16px 20px",
      borderBottom: `1px solid ${t.border}`,
      background: isUnread ? `${t.primary}06` : "transparent",
      transition: "background 0.2s",
      position: "relative",
    }}>
      {/* Linha de destaque lateral para não-lidas */}
      {isUnread && (
        <div style={{
          position: "absolute", left: 0, top: 12, bottom: 12,
          width: 3, borderRadius: "0 3px 3px 0",
          background: t.primary,
        }} />
      )}

      <div style={{ display: "flex", gap: 12 }}>
        {/* Ícone */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isDone
            ? "linear-gradient(135deg, #DCFCE7, #BBF7D0)"
            : isPending
            ? "linear-gradient(135deg, #EDE9FE, #DDD6FE)"
            : t.background,
          boxShadow: isDone
            ? "0 2px 8px #16A34A18"
            : isPending
            ? "0 2px 8px #7C3AED18"
            : "none",
        }}>
          {isDone
            ? <CheckCheck style={{ width: 18, height: 18, color: "#16A34A" }} />
            : <Building2  style={{ width: 17, height: 17, color: isPending ? "#7C3AED" : t.textSecondary }} />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Título + badge não-lido */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 13.5, fontWeight: isUnread ? 700 : 600,
              color: t.textPrimary, lineHeight: 1.35,
            }}>
              {isDone ? "Empresa ativada com sucesso" : notification.title}
            </span>
            <span
              suppressHydrationWarning
              style={{
                fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap", flexShrink: 0,
                marginTop: 1,
              }}
            >
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          {/* Corpo */}
          <p style={{
            margin: "4px 0 0",
            fontSize: 12.5, color: t.textSecondary, lineHeight: 1.55,
          }}>
            {isDone
              ? `${data.companyName ?? "A empresa"} já pode acessar a plataforma.`
              : notification.body
            }
          </p>

          {/* Chip de empresa */}
          {isPending && data.companyName && !isDone && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              marginTop: 8,
              padding: "3px 10px",
              borderRadius: 20,
              background: "#EDE9FE",
              fontSize: 11.5, fontWeight: 600, color: "#7C3AED",
            }}>
              <Building2 style={{ width: 11, height: 11 }} />
              {data.companyName}
            </div>
          )}

          {/* Botão ativar */}
          {isPending && data.companyUserId && !isDone && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onActivate(data.companyUserId, notification.id)}
              style={{
                marginTop: 10,
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                borderRadius: 9,
                border: "none",
                background: isLoading
                  ? t.border
                  : `linear-gradient(135deg, #0C6B64, ${t.primary})`,
                color: "#fff",
                fontSize: 12.5, fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading ? "none" : `0 3px 12px ${t.primary}35`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {isLoading
                ? <><Loader2 style={{ width: 12, height: 12, animation: "spin 0.9s linear infinite" }} /> Ativando…</>
                : <><Sparkles style={{ width: 12, height: 12 }} /> Ativar empresa</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [filter,        setFilter]        = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activatingId,  setActivatingId]  = useState<string | null>(null);
  const [activated,     setActivated]     = useState<Set<string>>(new Set());
  const [isPending,     startTransition]  = useTransition();

  const unread = notifications.filter((n) => !n.read && !activated.has(n.id)).length;

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read && !activated.has(n.id))
    : notifications;

  function fetchNotifications() {
    startTransition(async () => {
      const data = await getNotifications();
      setNotifications(data);
    });
  }

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  function handleActivate(companyUserId: string, notificationId: string) {
    setActivatingId(notificationId);
    startTransition(async () => {
      const result = await activateCompany(companyUserId, notificationId);
      if (result.ok) {
        setActivated((prev) => new Set(prev).add(notificationId));
        setNotifications((prev) =>
          prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
      setActivatingId(null);
    });
  }

  return (
    <>
      {/* ── Bell button ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "relative",
          width: 36, height: 36, borderRadius: 10,
          background: "transparent", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: t.textSecondary, cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.background;
          e.currentTarget.style.color = t.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = t.textSecondary;
        }}
      >
        <Bell style={{ width: 17, height: 17 }} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "#EF4444",
            border: `2px solid ${t.surface}`,
            animation: "pulseRed 2s infinite",
          }} />
        )}
      </button>

      {/* ── Sheet ────────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex flex-col p-0"
          style={{
            width: 400,
            maxWidth: "100vw",
            background: t.background,
            borderLeft: `1px solid ${t.border}`,
          }}
        >

          {/* ── Cabeçalho ──────────────────────────────────── */}
          <SheetHeader
            className="shrink-0"
            style={{
              padding: "20px 20px 0",
              background: t.surface,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {/* Linha superior */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Ícone decorativo */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, #0C6B64, ${t.primary})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 12px ${t.primary}30`,
                }}>
                  <Bell style={{ width: 16, height: 16, color: "#fff" }} />
                </div>
                <div>
                  <SheetTitle style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, margin: 0 }}>
                    Notificações
                  </SheetTitle>
                  <p style={{ margin: 0, fontSize: 11.5, color: t.textSecondary }}>
                    {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo em dia"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    title="Marcar todas como lidas"
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 11px", borderRadius: 8,
                      border: `1px solid ${t.border}`,
                      background: t.background,
                      fontSize: 12, fontWeight: 600, color: t.textSecondary,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = t.primary;
                      e.currentTarget.style.color = t.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.color = t.textSecondary;
                    }}
                  >
                    <CheckCheck style={{ width: 13, height: 13 }} />
                    Lidas
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32, height: 32,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.background,
                    cursor: "pointer", color: t.textSecondary,
                    fontSize: 16, lineHeight: 1,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FEE2E2";
                    e.currentTarget.style.color = "#DC2626";
                    e.currentTarget.style.borderColor = "#FECACA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = t.background;
                    e.currentTarget.style.color = t.textSecondary;
                    e.currentTarget.style.borderColor = t.border;
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs filtro */}
            <div style={{ display: "flex", gap: 0 }}>
              {(["all", "unread"] as const).map((tab) => {
                const label = tab === "all" ? "Todas" : "Não lidas";
                const count = tab === "unread" ? unread : notifications.length;
                const isActive = filter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: "8px 16px",
                      border: "none", background: "transparent",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? t.primary : t.textSecondary,
                      cursor: "pointer",
                      borderBottom: isActive ? `2px solid ${t.primary}` : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{
                        marginLeft: 6,
                        padding: "1px 6px",
                        borderRadius: 20,
                        fontSize: 10.5, fontWeight: 700,
                        background: isActive ? t.primary : t.border,
                        color: isActive ? "#fff" : t.textSecondary,
                        transition: "all 0.15s",
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SheetHeader>

          {/* ── Lista ──────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {isPending && notifications.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10, padding: "60px 24px",
              }}>
                <Loader2 style={{
                  width: 24, height: 24, color: t.primary,
                  animation: "spin 0.9s linear infinite",
                }} />
                <span style={{ fontSize: 13, color: t.textSecondary }}>
                  Carregando notificações…
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12, padding: "60px 32px", textAlign: "center",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: t.surface,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}>
                  <BellOff style={{ width: 26, height: 26, color: "#CBD5E1" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.textPrimary }}>
                    {filter === "unread" ? "Nenhuma não lida" : "Tudo em dia!"}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 12.5, color: t.textSecondary, lineHeight: 1.55 }}>
                    {filter === "unread"
                      ? "Você leu todas as notificações."
                      : "Novas notificações aparecerão aqui quando houver atividade na plataforma."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ background: t.surface }}>
                {filtered.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    activated={activated}
                    activatingId={activatingId}
                    onActivate={handleActivate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Rodapé ─────────────────────────────────────── */}
          {notifications.length > 0 && (
            <div style={{
              padding: "12px 20px",
              borderTop: `1px solid ${t.border}`,
              background: t.surface,
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontSize: 11.5, color: t.textSecondary, textAlign: "center" }}>
                Mostrando as últimas {notifications.length} notificações
              </p>
            </div>
          )}

        </SheetContent>
      </Sheet>

    </>
  );
}
