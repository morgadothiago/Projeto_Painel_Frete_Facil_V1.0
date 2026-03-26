"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  MapPin,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import {
  getCompanyDeliveries,
  getDeliveryStats,
  type Delivery,
  type DeliveryStats,
  type DeliveryStatus,
} from "@/app/actions/deliveries";

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS: Record<DeliveryStatus, {
  label: string; color: string; bg: string; accent: string; icon: typeof Package;
}> = {
  PENDING:     { label: "Pendente",  color: "#b45309", bg: "#fef9ee", accent: "#f59e0b", icon: Clock        },
  ACCEPTED:    { label: "Aceita",    color: "#1d4ed8", bg: "#eff6ff", accent: "#3b82f6", icon: Truck        },
  IN_PROGRESS: { label: "Em Curso",  color: "#1d4ed8", bg: "#eff6ff", accent: "#3b82f6", icon: Truck        },
  COMPLETED:   { label: "Entregue",  color: "#065f46", bg: "#f0fdf4", accent: "#10b981", icon: CheckCircle2 },
  CANCELLED:   { label: "Cancelado", color: "#991b1b", bg: "#fff5f5", accent: "#ef4444", icon: XCircle      },
};

const STATS_CARDS = [
  { label: "Entregues",  key: "completed"  as const, status: "COMPLETED",   color: "#10b981", icon: CheckCircle2 },
  { label: "Pendentes",  key: "pending"    as const, status: "PENDING",     color: "#f59e0b", icon: Clock        },
  { label: "Em Curso",   key: "inProgress" as const, status: "IN_PROGRESS", color: "#3b82f6", icon: Truck        },
  { label: "Cancelados", key: "cancelled"  as const, status: "CANCELLED",   color: "#ef4444", icon: XCircle      },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currency(v: string | number | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(typeof v === "string" ? parseFloat(v) : v);
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

type InitialData = { data: Delivery[]; stats: DeliveryStats; total: number };

export function MinhasEntregasClient({
  initialData,
  initialStats,
}: {
  initialData: InitialData;
  initialStats: DeliveryStats;
}) {
  const router = useRouter();

  const [deliveries, setDeliveries] = useState(initialData.data);
  const [total, setTotal]           = useState(initialData.total);
  // Stats globais — sempre refletem todos os status, independente do filtro ativo
  const [stats, setStats]           = useState(initialStats);

  const [loadingList, setLoadingList]   = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [statusFilter, setStatus] = useState("ALL");
  const [periodFilter, setPeriod] = useState("30");
  const [searchQuery,  setSearch] = useState("");
  const [page, setPage]           = useState(1);
  const limit = 10;

  // ── Fetch lista filtrada/paginada ────────────────────────────────────
  const fetchList = useCallback(async (opts?: {
    status?: string; period?: string; q?: string; p?: number;
  }) => {
    setLoadingList(true);
    try {
      const r = await getCompanyDeliveries({
        status: opts?.status ?? statusFilter,
        period: opts?.period ?? periodFilter,
        q:      opts?.q      ?? searchQuery,
        page:   opts?.p      ?? page,
        limit,
      });
      setDeliveries(r.data);
      setTotal(r.total);
    } catch (e) { console.error("[fetchList]", e); }
    finally { setLoadingList(false); }
  }, [statusFilter, periodFilter, searchQuery, page]);

  // ── Fetch contadores globais (sem filtro de status) ──────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const s = await getDeliveryStats();
      setStats(s);
    } catch (e) { console.error("[fetchStats]", e); }
    finally { setLoadingStats(false); }
  }, []);

  // ── Atualizar tudo ───────────────────────────────────────────────────
  const refresh = () => {
    fetchList();
    fetchStats();
  };

  const loading = loadingList || loadingStats;

  const toggleStatus = (s: string) => {
    const next = statusFilter === s ? "ALL" : s;
    setStatus(next);
    setPage(1);
    fetchList({ status: next, p: 1 });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 11.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Empresa
          </p>
          <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Minhas Entregas
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: "#64748B" }}>
            Acompanhe o histórico e status das suas entregas
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/minhas-entregas/mapa")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 12,
            background: "#0C6B64", color: "#fff",
            fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer",
            boxShadow: "0 2px 10px rgba(12,107,100,0.28)",
            whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <MapPin size={15} />
          Ver em Tempo Real
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {STATS_CARDS.map(card => {
          const Icon   = card.icon;
          const value  = stats[card.key];
          const active = statusFilter === card.status;
          return (
            <button
              key={card.status}
              onClick={() => toggleStatus(card.status)}
              style={{
                position: "relative", overflow: "hidden",
                background: "#fff", borderRadius: 18,
                border: `1.5px solid ${active ? card.color + "55" : "#E2E8F0"}`,
                padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", textAlign: "left",
                boxShadow: active ? `0 4px 20px ${card.color}22` : "0 2px 8px rgba(0,0,0,0.03)",
                transition: "all 0.18s",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: active ? card.color : "transparent",
                borderRadius: "18px 18px 0 0", transition: "background 0.18s",
              }} />
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: `${card.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: card.color,
              }}>
                {loadingStats
                  ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${card.color}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                  : <Icon size={20} />
                }
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0F172A", lineHeight: 1, letterSpacing: "-1px" }}>
                  {loadingStats ? "–" : value}
                </p>
                <p style={{ margin: "5px 0 0", fontSize: 12.5, fontWeight: 500, color: "#94A3B8" }}>
                  {card.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filtros ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", borderRadius: 16,
        border: "1px solid #E2E8F0", padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Buscar por código ou endereço…"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchList({ q: searchQuery, p: 1 }); } }}
            style={{
              width: "100%", height: 36, paddingLeft: 34, paddingRight: 12,
              borderRadius: 10, border: "1.5px solid #E2E8F0",
              fontSize: 13.5, color: "#334155",
              background: "#F8FAFC", outline: "none", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ width: 1, height: 24, background: "#E2E8F0", flexShrink: 0 }} />

        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={periodFilter}
            onChange={e => {
              const next = e.target.value;
              setPeriod(next);
              setPage(1);
              fetchList({ period: next, p: 1 });
            }}
            style={{
              height: 36, paddingLeft: 12, paddingRight: 30,
              borderRadius: 10, border: "1.5px solid #E2E8F0",
              fontSize: 13.5, color: "#334155",
              background: "#F8FAFC", outline: "none",
              cursor: "pointer", appearance: "none", fontFamily: "inherit",
            }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
        </div>

        <button
          onClick={refresh}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 36, padding: "0 14px",
            borderRadius: 10, border: "1.5px solid #E2E8F0",
            background: "#F8FAFC", color: "#64748B",
            fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          Atualizar
        </button>
      </div>

      {/* ── Lista ── */}
      {loadingList ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "2.5px solid #2EC4B6", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      ) : deliveries.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "64px 24px", borderRadius: 20,
          border: "1.5px dashed #E2E8F0", background: "#FAFBFC", gap: 10,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={24} color="#CBD5E1" />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#475569" }}>Nenhuma entrega encontrada</p>
          <p style={{ margin: 0, fontSize: 12.5, color: "#94A3B8" }}>Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {deliveries.map(d => <DeliveryCard key={d.id} delivery={d} />)}
          </div>

          {/* Paginação */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "#94A3B8" }}>
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total} entregas
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); fetchList({ p }); }}
                style={{
                  height: 34, padding: "0 14px", borderRadius: 10,
                  border: "1.5px solid #E2E8F0", background: "#fff",
                  color: page === 1 ? "#CBD5E1" : "#475569",
                  fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                ← Anterior
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => { const p = page + 1; setPage(p); fetchList({ p }); }}
                style={{
                  height: 34, padding: "0 14px", borderRadius: 10,
                  border: "1.5px solid #E2E8F0", background: "#fff",
                  color: page * limit >= total ? "#CBD5E1" : "#475569",
                  fontSize: 13, cursor: page * limit >= total ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Delivery Card ────────────────────────────────────────────────────────────

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const cfg   = STATUS[delivery.status];
  const Icon  = cfg.icon;
  const price = delivery.status === "COMPLETED"
    ? currency(delivery.finalPrice)
    : currency(delivery.estimatedPrice);

  return (
    <div
      style={{
        background: "#fff", borderRadius: 20,
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden", transition: "box-shadow 0.18s, border-color 0.18s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
      }}
    >
      {/* barra colorida no topo */}
      <div style={{ height: 3, background: cfg.accent }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600,
          }}>
            <Icon size={12} />
            {cfg.label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              {delivery.vehicleType.icon} {delivery.vehicleType.name}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#CBD5E1" }}>
              #{delivery.publicId.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Rota */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, gap: 3, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
            <div style={{ width: 1, height: 22, background: "#E2E8F0" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Origem</p>
              <p style={{ margin: "2px 0 0", fontSize: 13.5, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {delivery.originAddress}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Destino</p>
              <p style={{ margin: "2px 0 0", fontSize: 13.5, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {delivery.destAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "14px 0" }} />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1 }}>
              {price}
            </p>
            {delivery.estimatedDistance && (
              <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#94A3B8" }}>
                {delivery.estimatedDistance.toFixed(1)} km
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {delivery.driver ? (
              <>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#475569" }}>{delivery.driver.name}</p>
                <p style={{ margin: "2px 0", fontSize: 12, color: "#f59e0b" }}>
                  {"★".repeat(Math.round(delivery.driver.rating))}{" "}
                  <span style={{ color: "#94A3B8" }}>{delivery.driver.rating.toFixed(1)}</span>
                </p>
              </>
            ) : (
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "#CBD5E1" }}>Sem motorista</p>
            )}
            <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>{fmtDate(delivery.createdAt)}</p>
          </div>
        </div>

        {/* Avaliação */}
        {delivery.status === "COMPLETED" && delivery.rating && (
          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 10,
            background: "#FAFBFC", border: "1px solid #F1F5F9",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13, color: "#f59e0b" }}>{"★".repeat(delivery.rating)}</span>
            {delivery.comment && (
              <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                "{delivery.comment}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
