"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Building2, CheckCheck, Loader2, BellOff, Sparkles, X, Trash2, AlertCircle } from "lucide-react";
import { toast }          from "sonner";
import { tenantConfig }   from "@/config/tenant";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  getNotifications,
  markAllAsRead,
  activateCompany,
  clearAllNotifications,
  type AppNotification,
} from "@/app/actions/notifications";

const { theme: t } = tenantConfig;

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ── Item ─────────────────────────────────────────────────────────────────────

function NotificationItem({
  notification, activated, activatingId, onActivate,
}: {
  notification: AppNotification;
  activated:    Set<string>;
  activatingId: string | null;
  onActivate:   (userId: string, notifId: string) => void;
}) {
  const isCompanyPending = notification.type === "COMPANY_PENDING";
  const isPaymentPending = notification.type === "PAYMENT_PENDING";
  const isPending = isCompanyPending || isPaymentPending;
  const data      = notification.data ? JSON.parse(notification.data) : {};
  const isLoading = activatingId === notification.id;
  const isDone    = activated.has(notification.id);
  const isUnread  = !notification.read && !isDone;

  return (
    <div style={{
      padding: "14px 20px",
      borderBottom: `1px solid #F1F5F9`,
      background: isUnread ? "#F8FFFE" : "#fff",
      position: "relative",
      transition: "background 0.15s",
    }}>
      {/* Barra lateral colorida */}
      {isUnread && (
        <div style={{
          position: "absolute", left: 0, top: 14, bottom: 14,
          width: 3, borderRadius: "0 3px 3px 0",
          background: `linear-gradient(to bottom, #0C6B64, ${t.primary})`,
        }} />
      )}

      <div style={{ display: "flex", gap: 12 }}>
        {/* Ícone */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isDone
            ? "linear-gradient(135deg, #DCFCE7, #BBF7D0)"
            : isPaymentPending
            ? "linear-gradient(135deg, #FEF3C7, #FDE68A)"
            : isCompanyPending
            ? "linear-gradient(135deg, #EDE9FE, #C4B5FD)"
            : "#F1F5F9",
        }}>
          {isDone
            ? <CheckCheck style={{ width: 17, height: 17, color: "#16A34A" }} />
            : isPaymentPending
            ? <AlertCircle style={{ width: 17, height: 17, color: "#B45309" }} />
            : <Building2  style={{ width: 17, height: 17, color: isCompanyPending ? "#7C3AED" : "#94A3B8" }} />
          }
        </div>

          {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
            <p style={{
              margin: 0, fontSize: 13, lineHeight: 1.4,
              fontWeight: isUnread ? 700 : 600,
              color: isDone ? "#16A34A" : isPaymentPending ? "#B45309" : "#0F172A",
            }}>
              {isDone 
                ? (isCompanyPending ? "Empresa ativada!" : "Pagamento confirmado!")
                : notification.title}
            </p>
            <span suppressHydrationWarning style={{
              fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap",
              flexShrink: 0, marginTop: 1,
            }}>
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          <p style={{
            margin: "3px 0 0", fontSize: 12.5, color: "#64748B", lineHeight: 1.55,
          }}>
            {isDone
              ? (isCompanyPending 
                  ? `${data.companyName ?? "A empresa"} já pode acessar a plataforma.`
                  : "O pagamento foi processado com sucesso.")
              : notification.body
            }
          </p>

          {/* Chip empresa */}
          {isPending && data.companyName && !isDone && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              marginTop: 7, padding: "2px 9px", borderRadius: 20,
              background: isPaymentPending ? "#FEF3C7" : "#F3F0FF",
              color: isPaymentPending ? "#B45309" : "#7C3AED",
              fontSize: 11.5, fontWeight: 600,
            }}>
              <Building2 style={{ width: 10, height: 10 }} />
              {data.companyName}
            </span>
          )}

          {/* Botão ativar */}
          {isCompanyPending && data.companyUserId && !isDone && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onActivate(data.companyUserId, notification.id)}
              style={{
                marginTop: 10,
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8, border: "none",
                background: isLoading ? "#E2E8F0" : `linear-gradient(135deg, #0C6B64, ${t.primary})`,
                color: isLoading ? "#94A3B8" : "#fff",
                fontSize: 12, fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading ? "none" : `0 3px 10px ${t.primary}40`,
                transition: "all 0.2s",
              }}
            >
              {isLoading
                ? <><Loader2 style={{ width: 11, height: 11, animation: "spin 0.9s linear infinite" }} />Ativando…</>
                : <><Sparkles style={{ width: 11, height: 11 }} />Ativar empresa</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

const FILTERS = [
  { value: "all",    label: "Todas"     },
  { value: "unread", label: "Não lidas" },
] as const;

export function NotificationBell() {
  const [open,         setOpen]        = useState(false);
  const [filter,       setFilter]      = useState<"all" | "unread">("all");
  const [notifs,       setNotifs]      = useState<AppNotification[]>([]);
  const [activatingId, setActivating]  = useState<string | null>(null);
  const [activated,    setActivated]   = useState<Set<string>>(new Set());
  const [isPending,    startTransition] = useTransition();
  const knownIds = useRef<Set<string>>(new Set());
  const isFirst  = useRef(true);

  const unread = notifs.filter((n) => !n.read && !activated.has(n.id)).length;
  const filtered = filter === "unread"
    ? notifs.filter((n) => !n.read && !activated.has(n.id))
    : notifs;

  function fetchNotifs() {
    startTransition(async () => {
      const data = await getNotifications();
      setNotifs(data);

      // Detecta notificações novas após o primeiro carregamento
      if (isFirst.current) {
        data.forEach((n) => knownIds.current.add(n.id));
        isFirst.current = false;
      } else {
        const news = data.filter((n) => !knownIds.current.has(n.id) && !n.read);
        news.forEach((n) => {
          knownIds.current.add(n.id);
          toast(n.title, {
            description: n.body,
            icon: "🔔",
            duration: 6000,
          });
        });
      }
    });
  }

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 10_000);

    // Poll imediato ao voltar para a aba
    const onFocus = () => fetchNotifs();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Notificações marcadas como lidas.");
    });
  }

  function handleClearAll() {
    startTransition(async () => {
      await clearAllNotifications();
      setNotifs([]);
      toast.success("Todas as notificações foram removidas.");
    });
  }

  function handleActivate(companyUserId: string, notificationId: string) {
    setActivating(notificationId);
    startTransition(async () => {
      const res = await activateCompany(companyUserId, notificationId);
      if (res.ok) {
        setActivated((prev) => new Set(prev).add(notificationId));
        setNotifs((prev) => prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ));
        toast.success("Empresa ativada com sucesso!", {
          description: "A empresa já pode acessar a plataforma.",
        });
      } else {
        toast.error("Erro ao ativar empresa.", {
          description: res.error ?? "Tente novamente.",
        });
      }
      setActivating(null);
    });
  }

  return (
    <>
      {/* ── Bell ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: "relative",
          width: 36, height: 36, borderRadius: 10,
          border: "none", background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: t.textSecondary, cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.background; e.currentTarget.style.color = t.primary; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textSecondary; }}
      >
        <Bell style={{ width: 17, height: 17 }} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "#EF4444", border: `2px solid ${t.surface}`,
            animation: "pulseRed 2s infinite",
          }} />
        )}
      </button>

      {/* ── Sheet ─────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex flex-col p-0"
          style={{ width: 390, maxWidth: "100vw", border: "none", padding: 0 }}
        >

          {/* ── Header com gradiente ─────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #0C6B64 0%, #2EC4B6 100%)",
            padding: "24px 22px 0",
            flexShrink: 0,
          }}>
            {/* Linha superior */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Ícone */}
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                    Notificações
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>
                    {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo em dia"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Limpar todas */}
                {notifs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 11px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", backdropFilter: "blur(4px)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  >
                    <Trash2 style={{ width: 12, height: 12 }} />
                    Limpar
                  </button>
                )}
                {/* Marcar todas */}
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 11px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", backdropFilter: "blur(4px)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  >
                    <CheckCheck style={{ width: 12, height: 12 }} />
                    Lidas
                  </button>
                )}
                {/* Fechar */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", cursor: "pointer", backdropFilter: "blur(4px)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* Tabs dentro do header */}
            <div style={{ display: "flex", gap: 0 }}>
              {FILTERS.map((f) => {
                const active = filter === f.value;
                const count  = f.value === "unread" ? unread : notifs.length;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    style={{
                      padding: "9px 16px",
                      border: "none", background: "transparent",
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      borderBottom: active ? "2.5px solid #fff" : "2.5px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {f.label}
                    {count > 0 && (
                      <span style={{
                        marginLeft: 6, padding: "1px 6px",
                        borderRadius: 20, fontSize: 10.5, fontWeight: 700,
                        background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                        color: "#fff",
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Lista ────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: "auto", background: "#F8FAFC" }}>

            {/* Loading inicial */}
            {isPending && notifs.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12, height: 260,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}>
                  <Loader2 style={{ width: 20, height: 20, color: t.primary, animation: "spin 0.9s linear infinite" }} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Carregando…</p>
              </div>

            /* Empty state */
            ) : filtered.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 14, padding: "60px 32px", textAlign: "center",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                }}>
                  <BellOff style={{ width: 26, height: 26, color: "#CBD5E1" }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                    {filter === "unread" ? "Nenhuma não lida" : "Tudo em dia!"}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
                    {filter === "unread"
                      ? "Você já leu todas as notificações."
                      : "Novas notificações aparecerão aqui."}
                  </p>
                </div>
              </div>

            /* Lista */
            ) : (
              <div style={{ background: "#fff" }}>
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

          {/* ── Footer ───────────────────────────────────── */}
          {notifs.length > 0 && (
            <div style={{
              padding: "12px 20px",
              background: "#fff",
              borderTop: "1px solid #F1F5F9",
              flexShrink: 0,
              textAlign: "center",
            }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>
                {notifs.length} notificaç{notifs.length !== 1 ? "ões" : "ão"} no total
              </span>
            </div>
          )}

        </SheetContent>
      </Sheet>
    </>
  );
}
