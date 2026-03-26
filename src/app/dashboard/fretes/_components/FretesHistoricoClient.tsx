"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  Calendar,
  User,
  Route,
  X,
  Weight,
  MapPin,
  Phone,
  Mail,
  Building2,
  Truck,
  HelpCircle,
  Clock,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getFretesHistorico,
  type Delivery,
  type FretesHistoricoResult,
} from "@/app/actions/deliveries";

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS: Record<string, {
  label: string; color: string; bg: string; accent: string; icon: typeof Package;
}> = {
  COMPLETED: { label: "Finalizado", color: "#065f46", bg: "#f0fdf4", accent: "#10b981", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado",  color: "#991b1b", bg: "#fff5f5", accent: "#ef4444", icon: XCircle },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function currency(v: string | number | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(typeof v === "string" ? parseFloat(v) : v);
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function fmtDateTime(s: string) {
  return new Date(s).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtTime(s: string) {
  return new Date(s).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function fmtWeight(kg: number | null) {
  if (!kg) return null;
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
  return `${kg} kg`;
}

// ─── Componente principal ──────────────────────────────────────────────────

export function FretesHistoricoClient({
  initialData,
}: {
  initialData: FretesHistoricoResult;
}) {
  const isMobile = useIsMobile();
  const [deliveries, setDeliveries] = useState(initialData.data);
  const [total, setTotal]           = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("COMPLETED");
  const [searchQuery, setSearchQuery]   = useState("");
  const [page, setPage]                 = useState(1);
  const limit = 10;

  const [selected, setSelected] = useState<Delivery | null>(null);

  const fetchList = useCallback(async (opts?: {
    status?: string; q?: string; p?: number;
  }) => {
    setLoading(true);
    try {
      const r = await getFretesHistorico({
        status: opts?.status ?? statusFilter,
        q:      opts?.q      ?? searchQuery,
        page:   opts?.p      ?? page,
        limit,
      });
      setDeliveries(r.data);
      setTotal(r.total);
      setTotalPages(r.totalPages);
    } catch (e) { console.error("[FretesHistorico]", e); }
    finally { setLoading(false); }
  }, [statusFilter, searchQuery, page]);

  const handleStatusChange = (s: string) => {
    setStatusFilter(s);
    setPage(1);
    fetchList({ status: s, p: 1 });
  };

  const handleSearch = () => {
    setPage(1);
    fetchList({ q: searchQuery, p: 1 });
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchList({ p });
  };

  const refresh = () => fetchList();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Filtros ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
        background: "#fff", borderRadius: 14,
        border: "1px solid #E2E8F0", padding: "10px 14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "COMPLETED", label: "Finalizados",    icon: CheckCircle2 },
            { key: "CANCELLED", label: "Cancelados",     icon: XCircle },
          ].map(tab => {
            const active = statusFilter === tab.key;
            const Icon   = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: isMobile ? "6px 10px" : "7px 14px", borderRadius: 8,
                  border: `1.5px solid ${active ? "#2EC4B6" : "#E2E8F0"}`,
                  background: active ? "#E6FAF8" : "#fff",
                  color: active ? "#0C6B64" : "#64748B",
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {Icon && <Icon size={13} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 28, background: "#E2E8F0", flexShrink: 0 }} />

        <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "100%" : 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Buscar por código, endereço ou motorista…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            style={{
              width: "100%", height: 34, paddingLeft: 32, paddingRight: 12,
              borderRadius: 8, border: "1.5px solid #E2E8F0",
              fontSize: 13, color: "#334155",
              background: "#F8FAFC", outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        <button
          onClick={refresh}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 34, padding: "0 12px",
            borderRadius: 8, border: "1.5px solid #E2E8F0",
            background: "#fff", color: "#64748B",
            fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          Atualizar
        </button>
      </div>

      {/* ── Contador ── */}
      <p style={{ margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 }}>
        {loading ? "Carregando…" : `${total} frete${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
      </p>

      {/* ── Conteúdo ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "3px solid #E2E8F0", borderTopColor: "#2EC4B6",
            animation: "spin 0.7s linear infinite",
          }} />
        </div>
      ) : deliveries.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "80px 24px", borderRadius: 16,
          border: "1.5px dashed #E2E8F0", background: "#FAFBFC", gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg,#F1F5F9,#E2E8F0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={26} color="#94A3B8" />
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#475569" }}>Nenhum frete encontrado</p>
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>Tente ajustar os filtros de busca</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {deliveries.map(d => <FreteCard key={d.id} delivery={d} onClick={() => setSelected(d)} />)}
            </div>
          ) : (
            <FreteTable deliveries={deliveries} onSelect={setSelected} />
          )}

          <Pagination
            page={page}
            total={total}
            limit={limit}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}

      {/* ── Modal de detalhes ── */}
      {selected && (
        <FreteDetailModal delivery={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── TABELA (Desktop) ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function FreteTable({ deliveries, onSelect }: { deliveries: Delivery[]; onSelect: (d: Delivery) => void }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid #E2E8F0", overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #F1F5F9" }}>
            {["Status", "Código", "Rota", "Motorista", "Veículo", "Valor", "Data"].map(h => (
              <th key={h} style={{
                padding: "12px 16px", textAlign: "left",
                fontSize: 11, fontWeight: 700, color: "#94A3B8",
                textTransform: "uppercase", letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d, i) => <FreteTableRow key={d.id} delivery={d} zebra={i % 2 === 1} onClick={() => onSelect(d)} />)}
        </tbody>
      </table>
    </div>
  );
}

function FreteTableRow({ delivery, zebra, onClick }: { delivery: Delivery; zebra: boolean; onClick: () => void }) {
  const cfg  = STATUS[delivery.status] ?? STATUS.COMPLETED;
  const Icon = cfg.icon;
  const price = delivery.status === "COMPLETED" ? currency(delivery.finalPrice) : currency(delivery.estimatedPrice);

  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: "1px solid #F1F5F9",
        background: zebra ? "#FAFBFC" : "#fff",
        transition: "background 0.12s",
        cursor: "pointer",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F0F9FF"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = zebra ? "#FAFBFC" : "#fff"; }}
    >
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 6,
          background: cfg.bg, color: cfg.color,
          fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
        }}>
          <Icon size={11} />
          {cfg.label}
        </span>
      </td>
      <td style={{ padding: "12px 16px" }}>
        <span style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 12, color: "#64748B", fontWeight: 500,
          background: "#F1F5F9", padding: "2px 8px", borderRadius: 4,
        }}>
          #{fmtShortId(delivery.publicId)}
        </span>
      </td>
      <td style={{ padding: "12px 16px", maxWidth: 280 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{delivery.originAddress}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{delivery.destAddress}</span>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        {delivery.driver ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {delivery.driver.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "#334155" }}>{delivery.driver.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Star size={10} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{delivery.driver.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "#CBD5E1" }}>—</span>
        )}
      </td>
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12.5, color: "#475569" }}>
          {delivery.vehicleType.icon} {delivery.vehicleType.name}
        </span>
      </td>
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{price}</span>
          {delivery.estimatedDistance && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>{delivery.estimatedDistance.toFixed(1)} km</p>
          )}
        </div>
      </td>
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12.5, color: "#475569", fontWeight: 500 }}>{fmtDate(delivery.createdAt)}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#94A3B8" }}>{fmtTime(delivery.createdAt)}</p>
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── CARD (Mobile) ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function FreteCard({ delivery, onClick }: { delivery: Delivery; onClick: () => void }) {
  const cfg  = STATUS[delivery.status] ?? STATUS.COMPLETED;
  const Icon = cfg.icon;
  const price = delivery.status === "COMPLETED" ? currency(delivery.finalPrice) : currency(delivery.estimatedPrice);

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        overflow: "hidden", cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.borderColor = "#CBD5E1";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 9px", borderRadius: 6,
            background: cfg.bg, color: cfg.color, fontSize: 11.5, fontWeight: 600,
          }}>
            <Icon size={11} />
            {cfg.label}
          </span>
          <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
            #{fmtShortId(delivery.publicId)}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>
          {delivery.vehicleType.icon} {delivery.vehicleType.name}
        </span>
      </div>

      {/* Corpo */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", border: "2px solid #D1FAE5" }} />
            <div style={{ width: 1.5, height: 20, background: "linear-gradient(180deg,#10b981,#ef4444)", opacity: 0.3 }} />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "2px solid #FEE2E2" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>Origem</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{delivery.originAddress}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Destino</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{delivery.destAddress}</p>
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 10,
          background: "#F8FAFC", border: "1px solid #F1F5F9",
        }}>
          {delivery.driver ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {delivery.driver.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{delivery.driver.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{delivery.driver.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <User size={14} color="#CBD5E1" />
              <span style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 500 }}>Sem motorista</span>
            </div>
          )}
          {delivery.estimatedDistance && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", borderRadius: 6,
              background: "#fff", border: "1px solid #E2E8F0", flexShrink: 0,
            }}>
              <Route size={11} color="#94A3B8" />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#475569" }}>{delivery.estimatedDistance.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderTop: "1px solid #F1F5F9", background: "#FAFBFC",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {delivery.status === "COMPLETED" ? "Valor final" : "Valor estimado"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1 }}>{price}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <Calendar size={11} color="#94A3B8" />
            <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontWeight: 500 }}>{fmtDate(delivery.createdAt)}</p>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>{fmtTime(delivery.createdAt)}</p>
        </div>
      </div>

      {delivery.status === "COMPLETED" && delivery.rating && (
        <div style={{
          padding: "10px 16px", borderTop: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", gap: 8, background: "#FFFBEB",
        }}>
          <div style={{ display: "flex", gap: 1 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={12} fill={i < (delivery.rating ?? 0) ? "#f59e0b" : "#E2E8F0"} color={i < (delivery.rating ?? 0) ? "#f59e0b" : "#E2E8F0"} />
            ))}
          </div>
          {delivery.comment && (
            <p style={{ margin: 0, fontSize: 12, color: "#92400E", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              &quot;{delivery.comment}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MODAL DE DETALHES ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function FreteDetailModal({ delivery, onClose }: { delivery: Delivery; onClose: () => void }) {
  const isMobile = useIsMobile();
  const cfg  = STATUS[delivery.status] ?? STATUS.COMPLETED;
  const Icon = cfg.icon;

  const price = delivery.status === "COMPLETED" ? currency(delivery.finalPrice) : currency(delivery.estimatedPrice);
  const weight = fmtWeight(delivery.weight);

  // Fechar com ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
        padding: isMobile ? 0 : 24,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          width: isMobile ? "100%" : "100%",
          maxWidth: isMobile ? "100%" : 620,
          maxHeight: isMobile ? "90vh" : "85vh",
          overflow: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          animation: isMobile ? "slideUp 0.2s ease" : "scaleIn 0.15s ease",
        }}
      >
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #F1F5F9",
          background: "#fff",
          borderRadius: isMobile ? "20px 20px 0 0" : "20px 20px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 6,
              background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600,
            }}>
              <Icon size={13} />
              {cfg.label}
            </span>
            <span style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 13, color: "#0F172A", fontWeight: 600,
            }}>
              #{fmtShortId(delivery.publicId)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid #E2E8F0", background: "#F8FAFC",
              color: "#64748B", cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Rota completa */}
          <Section title="Rota" icon={<Route size={14} color="#0C6B64" />}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", border: "2.5px solid #D1FAE5" }} />
                <div style={{ width: 2, height: 32, background: "linear-gradient(180deg,#10b981,#ef4444)", opacity: 0.25 }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", border: "2.5px solid #FEE2E2" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>Origem</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13.5, fontWeight: 600, color: "#1E293B" }}>{delivery.originAddress}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Destino</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13.5, fontWeight: 600, color: "#1E293B" }}>{delivery.destAddress}</p>
                </div>
              </div>
            </div>
            {delivery.estimatedDistance && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: "#F8FAFC", border: "1px solid #F1F5F9",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <MapPin size={13} color="#94A3B8" />
                <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
                  Distância estimada: <strong>{delivery.estimatedDistance.toFixed(1)} km</strong>
                </span>
              </div>
            )}
          </Section>

          {/* Motorista */}
          <Section title="Motorista" icon={<User size={14} color="#0C6B64" />}>
            {delivery.driver ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0,
                }}>
                  {delivery.driver.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{delivery.driver.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{delivery.driver.rating.toFixed(1)}</span>
                    </div>
                    {delivery.driver.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} color="#94A3B8" />
                        <span style={{ fontSize: 12.5, color: "#64748B" }}>{delivery.driver.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: "16px", borderRadius: 10,
                background: "#F8FAFC", textAlign: "center",
              }}>
                <User size={20} color="#CBD5E1" />
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Nenhum motorista atribuído</p>
              </div>
            )}
          </Section>

          {/* Empresa */}
          {delivery.company && (
            <Section title="Empresa" icon={<Building2 size={14} color="#0C6B64" />}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#F0F9FF", border: "1px solid #DBEAFE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Building2 size={16} color="#3B82F6" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{delivery.company.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
                    {delivery.company.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={11} color="#94A3B8" />
                        <span style={{ fontSize: 12, color: "#64748B" }}>{delivery.company.email}</span>
                      </div>
                    )}
                    {delivery.company.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={11} color="#94A3B8" />
                        <span style={{ fontSize: 12, color: "#64748B" }}>{delivery.company.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Carga e veículo */}
          <Section title="Carga e Veículo" icon={<Truck size={14} color="#0C6B64" />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoChip label="Veículo" value={`${delivery.vehicleType.icon} ${delivery.vehicleType.name}`} />
              {weight && <InfoChip label="Peso" value={weight} icon={<Weight size={12} color="#94A3B8" />} />}
              {delivery.cargoDescription && <InfoChip label="Descrição" value={delivery.cargoDescription} span2 />}
              <InfoChip label="Ajudante" value={delivery.needsHelper ? "Sim" : "Não"} icon={<HelpCircle size={12} color="#94A3B8" />} />
              {delivery.additionalStops > 0 && <InfoChip label="Paradas extras" value={`${delivery.additionalStops}`} />}
            </div>
          </Section>

          {/* Valor */}
          <div style={{
            padding: "16px 20px", borderRadius: 14,
            background: "linear-gradient(135deg,#F0FDFB,#E6FAF8)",
            border: "1.5px solid #2EC4B630",
          }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#0C6B64", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {delivery.status === "COMPLETED" ? "Valor Final" : "Valor Estimado"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: "#0C6B64", letterSpacing: "-1px", lineHeight: 1 }}>
              {price}
            </p>
          </div>

          {/* Datas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoChip label="Criado em" value={fmtDateTime(delivery.createdAt)} icon={<Calendar size={12} color="#94A3B8" />} />
            {delivery.scheduledAt && <InfoChip label="Agendado" value={fmtDateTime(delivery.scheduledAt)} icon={<Clock size={12} color="#94A3B8" />} />}
          </div>

          {/* Avaliação */}
          {delivery.status === "COMPLETED" && delivery.rating && (
            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: "#FFFBEB", border: "1px solid #FDE68A",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: delivery.comment ? 8 : 0 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={16} fill={i < (delivery.rating ?? 0) ? "#f59e0b" : "#E2E8F0"} color={i < (delivery.rating ?? 0) ? "#f59e0b" : "#E2E8F0"} />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>{delivery.rating}/5</span>
              </div>
              {delivery.comment && (
                <p style={{ margin: 0, fontSize: 13, color: "#92400E", fontStyle: "italic", lineHeight: 1.5 }}>
                  &quot;{delivery.comment}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "#E6FAF8", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoChip({ label, value, icon, span2 }: { label: string; value: string; icon?: React.ReactNode; span2?: boolean }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10,
      background: "#F8FAFC", border: "1px solid #F1F5F9",
      gridColumn: span2 ? "span 2" : undefined,
    }}>
      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
        {icon}
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Paginação ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function Pagination({
  page, total, limit, totalPages, onPageChange, loading,
}: {
  page: number; total: number; limit: number; totalPages: number;
  onPageChange: (p: number) => void; loading: boolean;
}) {
  if (total === 0) return null;

  const start   = (page - 1) * limit + 1;
  const end     = Math.min(page * limit, total);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12,
    }}>
      <p style={{ margin: 0, fontSize: 12.5, color: "#94A3B8" }}>
        Mostrando <strong style={{ color: "#475569" }}>{start}–{end}</strong> de <strong style={{ color: "#475569" }}>{total}</strong>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          disabled={!canPrev || loading}
          onClick={() => onPageChange(page - 1)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8,
            border: "1px solid #E2E8F0", background: "#fff",
            color: canPrev ? "#475569" : "#CBD5E1",
            cursor: canPrev ? "pointer" : "not-allowed", fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={15} />
        </button>
        {generatePageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} style={{ color: "#CBD5E1", fontSize: 12, padding: "0 2px" }}>…</span>
          ) : (
            <button
              key={p}
              disabled={loading}
              onClick={() => onPageChange(p as number)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minWidth: 32, height: 32, padding: "0 4px", borderRadius: 8,
                border: p === page ? "none" : "1px solid #E2E8F0",
                background: p === page ? "linear-gradient(135deg,#0C6B64,#2EC4B6)" : "#fff",
                color: p === page ? "#fff" : "#475569",
                fontSize: 12.5, fontWeight: p === page ? 700 : 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {p}
            </button>
          ),
        )}
        <button
          disabled={!canNext || loading}
          onClick={() => onPageChange(page + 1)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8,
            border: "1px solid #E2E8F0", background: "#fff",
            color: canNext ? "#475569" : "#CBD5E1",
            cursor: canNext ? "pointer" : "not-allowed", fontFamily: "inherit",
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
