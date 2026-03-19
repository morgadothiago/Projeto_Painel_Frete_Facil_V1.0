"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Building2, CheckCheck, Loader2, BellOff, Sparkles, X } from "lucide-react";
import { toast }          from "sonner";
import { cn }             from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  getNotifications,
  markAllAsRead,
  activateCompany,
  type AppNotification,
} from "@/app/actions/notifications";

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
  const isPending = notification.type === "COMPANY_PENDING";
  const data      = notification.data ? JSON.parse(notification.data) : {};
  const isLoading = activatingId === notification.id;
  const isDone    = activated.has(notification.id);
  const isUnread  = !notification.read && !isDone;

  return (
    <div className={cn(
      "px-5 py-[14px] border-b border-[#F1F5F9] relative transition-colors duration-150",
      isUnread ? "bg-[#F8FFFE]" : "bg-white",
    )}>
      {/* Barra lateral colorida */}
      {isUnread && (
        <div className="absolute left-0 top-[14px] bottom-[14px] w-[3px] rounded-r-[3px] bg-[linear-gradient(to_bottom,#0C6B64,#2EC4B6)]" />
      )}

      <div className="flex gap-3">
        {/* Ícone */}
        <div className={cn(
          "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
          isDone
            ? "bg-[linear-gradient(135deg,#DCFCE7,#BBF7D0)]"
            : isPending
            ? "bg-[linear-gradient(135deg,#EDE9FE,#C4B5FD)]"
            : "bg-[#F1F5F9]",
        )}>
          {isDone
            ? <CheckCheck className="w-[17px] h-[17px] text-green-600" />
            : <Building2  className={cn("w-[17px] h-[17px]", isPending ? "text-violet-600" : "text-[#94A3B8]")} />
          }
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <p className={cn(
              "m-0 text-[13px] leading-[1.4]",
              isUnread ? "font-bold" : "font-semibold",
              isDone ? "text-green-600" : "text-[#0F172A]",
            )}>
              {isDone ? "Empresa ativada!" : notification.title}
            </p>
            <span suppressHydrationWarning className="text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0 mt-[1px]">
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          <p className="mt-[3px] text-[12.5px] text-[#64748B] leading-[1.55]">
            {isDone
              ? `${data.companyName ?? "A empresa"} já pode acessar a plataforma.`
              : notification.body
            }
          </p>

          {/* Chip empresa */}
          {isPending && data.companyName && !isDone && (
            <span className="inline-flex items-center gap-1 mt-[7px] px-[9px] py-[2px] rounded-[20px] bg-[#F3F0FF] text-violet-600 text-[11.5px] font-semibold">
              <Building2 className="w-[10px] h-[10px]" />
              {data.companyName}
            </span>
          )}

          {/* Botão ativar */}
          {isPending && data.companyUserId && !isDone && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onActivate(data.companyUserId, notification.id)}
              className={cn(
                "mt-[10px] inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-lg border-none",
                "text-[12px] font-bold transition-all duration-200",
                isLoading
                  ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none"
                  : "bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white cursor-pointer shadow-[0_3px_10px_#2EC4B640]",
              )}
            >
              {isLoading
                ? <><Loader2 className="w-[11px] h-[11px] animate-spin" />Ativando…</>
                : <><Sparkles className="w-[11px] h-[11px]" />Ativar empresa</>
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
        className="relative w-9 h-9 rounded-[10px] border-none bg-transparent flex items-center justify-center text-muted-foreground cursor-pointer transition-[background,color] duration-150 hover:bg-background hover:text-primary"
      >
        <Bell className="w-[17px] h-[17px]" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white [animation:pulseRed_2s_infinite]" />
        )}
      </button>

      {/* ── Sheet ─────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex flex-col p-0 w-[390px] max-w-[100vw] border-none"
        >

          {/* ── Header com gradiente ─────────────────────── */}
          <div className="bg-[linear-gradient(135deg,#0C6B64_0%,#2EC4B6_100%)] pt-6 px-[22px] pb-0 shrink-0">
            {/* Linha superior */}
            <div className="flex items-start justify-between mb-[18px]">
              <div className="flex items-center gap-3">
                {/* Ícone */}
                <div className="w-[42px] h-[42px] rounded-[13px] bg-white/[0.18] border border-white/[0.28] backdrop-blur-[8px] flex items-center justify-center">
                  <Bell className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <h2 className="m-0 text-base font-extrabold text-white tracking-[-0.3px]">
                    Notificações
                  </h2>
                  <p className="m-0 text-[12px] text-white/70 mt-[1px]">
                    {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo em dia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Marcar todas */}
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    className="flex items-center gap-[5px] px-[11px] py-[6px] rounded-lg border border-white/30 bg-white/15 text-white text-[12px] font-semibold cursor-pointer backdrop-blur-[4px] transition-[background] duration-150 hover:bg-white/25"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Lidas
                  </button>
                )}
                {/* Fechar */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-[9px] border border-white/30 bg-white/15 flex items-center justify-center text-white cursor-pointer backdrop-blur-[4px] transition-[background] duration-150 hover:bg-white/[0.28]"
                >
                  <X className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>

            {/* Tabs dentro do header */}
            <div className="flex gap-0">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                const count  = f.value === "unread" ? unread : notifs.length;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "px-4 py-[9px] border-none bg-transparent text-[13px] cursor-pointer transition-all duration-150",
                      active
                        ? "font-bold text-white border-b-[2.5px] border-white"
                        : "font-medium text-white/60 border-b-[2.5px] border-transparent",
                    )}
                  >
                    {f.label}
                    {count > 0 && (
                      <span className={cn(
                        "ml-1.5 px-[6px] py-[1px] rounded-[20px] text-[10.5px] font-bold text-white",
                        active ? "bg-white/25" : "bg-white/[0.12]",
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Lista ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">

            {/* Loading inicial */}
            {isPending && notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 h-[260px]">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <p className="m-0 text-[13px] text-[#64748B]">Carregando…</p>
              </div>

            /* Empty state */
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-[14px] px-8 py-[60px] text-center">
                <div className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
                  <BellOff className="w-[26px] h-[26px] text-[#CBD5E1]" />
                </div>
                <div>
                  <p className="m-0 text-[15px] font-bold text-[#0F172A]">
                    {filter === "unread" ? "Nenhuma não lida" : "Tudo em dia!"}
                  </p>
                  <p className="mt-1.5 text-[13px] text-[#64748B] leading-[1.55]">
                    {filter === "unread"
                      ? "Você já leu todas as notificações."
                      : "Novas notificações aparecerão aqui."}
                  </p>
                </div>
              </div>

            /* Lista */
            ) : (
              <div className="bg-white">
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
            <div className="px-5 py-3 bg-white border-t border-[#F1F5F9] shrink-0 text-center">
              <span className="text-[12px] text-[#94A3B8]">
                {notifs.length} notificaç{notifs.length !== 1 ? "ões" : "ão"} no total
              </span>
            </div>
          )}

        </SheetContent>
      </Sheet>
    </>
  );
}
