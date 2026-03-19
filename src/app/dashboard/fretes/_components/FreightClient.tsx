"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Package, ChevronRight, XCircle, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import {
  type DeliveryRow,
  type DeliveryStatus,
  getDeliveries,
  cancelDelivery,
} from "@/app/actions/freight";
import type { VehicleTypeRow } from "@/app/actions/vehicleTypes";
import type { CompanyRow }     from "@/app/actions/companies";
import { FreightFormSheet }    from "./FreightFormSheet";
import { FreightDetailSheet }  from "./FreightDetailSheet";

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pendente",      color: "#B45309", bg: "#FEF3C7" },
  ACCEPTED:   { label: "Aceito",        color: "#1D4ED8", bg: "#DBEAFE" },
  COLLECTING: { label: "Coletando",     color: "#7C3AED", bg: "#EDE9FE" },
  IN_TRANSIT: { label: "Em trânsito",   color: "#C2410C", bg: "#FFEDD5" },
  DELIVERED:  { label: "Entregue",      color: "#065F46", bg: "#D1FAE5" },
  CANCELLED:  { label: "Cancelado",     color: "#9F1239", bg: "#FFE4E6" },
  FAILED:     { label: "Falhou",        color: "#7F1D1D", bg: "#FEE2E2" },
};

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#64748B", bg: "#F1F5F9" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

// ── Vehicle class emoji ────────────────────────────────────────────────────────

const CLASS_EMOJI: Record<string, string> = {
  MOTO:            "🏍️",
  CARRO:           "🚗",
  VAN:             "🚐",
  CAMINHAO_LEVE:   "🚚",
  CAMINHAO_PESADO: "🚛",
};

function classEmoji(v: string) {
  return CLASS_EMOJI[v] ?? "🚗";
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #E2E8F0",
      padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#64748B", marginTop: 3, fontWeight: 500 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FreightClient({
  initialData,
  vehicleTypes,
  companies,
}: {
  initialData:  DeliveryRow[];
  vehicleTypes: VehicleTypeRow[];
  companies:    CompanyRow[];
}) {
  const [rows,       setRows]       = useState<DeliveryRow[]>(initialData);
  const [sheetOpen,  setSheetOpen]  = useState(false);
  const [detailRow,  setDetailRow]  = useState<DeliveryRow | null>(null);
  const [isPending,  start]         = useTransition();

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total      = rows.length;
  const pending    = rows.filter((r) => r.status === "PENDING").length;
  const inProgress = rows.filter((r) =>
    ["ACCEPTED", "COLLECTING", "IN_TRANSIT"].includes(r.status),
  ).length;
  const delivered  = rows.filter((r) => r.status === "DELIVERED").length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCreated() {
    start(async () => {
      const updated = await getDeliveries();
      setRows(updated);
    });
  }

  function handleCancel(row: DeliveryRow) {
    if (!confirm(`Cancelar frete ${row.publicId}? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      const res = await cancelDelivery(row.id);
      if (!res.ok) {
        toast.error(res.error ?? "Erro ao cancelar frete.");
        return;
      }
      toast.success(`Frete ${row.publicId} cancelado.`);
      const updated = await getDeliveries();
      setRows(updated);
    });
  }

  const canCancel = (status: DeliveryStatus) =>
    status === "PENDING" || status === "ACCEPTED";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 14,
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}>
        <StatCard
          icon={<Package style={{ width: 18, height: 18 }} />}
          label="Total de fretes"
          value={total}
          color="#2EC4B6"
        />
        <StatCard
          icon={<Clock style={{ width: 18, height: 18 }} />}
          label="Pendentes"
          value={pending}
          color="#B45309"
        />
        <StatCard
          icon={<Truck style={{ width: 18, height: 18 }} />}
          label="Em andamento"
          value={inProgress}
          color="#1D4ED8"
        />
        <StatCard
          icon={<CheckCircle style={{ width: 18, height: 18 }} />}
          label="Entregues"
          value={delivered}
          color="#065F46"
        />
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11, border: "none",
            background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(46,196,182,0.35)",
          }}
        >
          <Package style={{ width: 15, height: 15 }} />
          Novo frete
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid #E2E8F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        overflow: "hidden",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "100px 1fr 1fr 140px 110px 90px 90px 80px",
          padding: "12px 18px",
          borderBottom: "1px solid #F1F5F9",
          background: "#F8FAFC",
        }}>
          {["#ID", "Empresa", "Origem → Destino", "Tipo veículo", "Status", "Valor", "Data", "Ações"].map((h) => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#94A3B8",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div style={{
            padding: "60px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <AlertCircle style={{ width: 36, height: 36, color: "#CBD5E1" }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              Nenhum frete cadastrado
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
              Clique em &quot;Novo frete&quot; para começar.
            </p>
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 1fr 140px 110px 90px 90px 80px",
                padding: "14px 18px",
                borderBottom: idx < rows.length - 1 ? "1px solid #F1F5F9" : "none",
                alignItems: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "#FAFBFC";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Public ID */}
              <span style={{
                fontSize: 12, fontWeight: 700, color: "#2EC4B6",
                fontFamily: "monospace",
              }}>
                {row.publicId}
              </span>

              {/* Empresa */}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                {row.companyName}
              </span>

              {/* Origem → Destino */}
              <div style={{ paddingRight: 12 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "#0F172A", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.originCity}/{row.originState}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  → {row.destinationCity}/{row.destinationState}
                </p>
              </div>

              {/* Tipo veículo */}
              <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
                {classEmoji(row.vehicleClass)} {row.vehicleTypeName}
              </span>

              {/* Status */}
              <StatusBadge status={row.status} />

              {/* Valor */}
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {row.estimatedPrice != null
                  ? `R$ ${row.estimatedPrice.toFixed(2)}`
                  : <span style={{ color: "#94A3B8" }}>—</span>
                }
              </span>

              {/* Data */}
              <span style={{ fontSize: 12, color: "#64748B" }}>
                {new Date(row.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </span>

              {/* Ações */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  title="Ver detalhes"
                  onClick={() => setDetailRow(row)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: "1px solid #E2E8F0", background: "#F8FAFC",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#475569",
                  }}
                >
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </button>

                {canCancel(row.status) && (
                  <button
                    title="Cancelar frete"
                    onClick={() => handleCancel(row)}
                    disabled={isPending}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: "1px solid #FEE2E2", background: "#FFF5F5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: isPending ? "not-allowed" : "pointer",
                      color: "#EF4444",
                    }}
                  >
                    <XCircle style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New freight sheet */}
      <FreightFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        vehicleTypes={vehicleTypes}
        companies={companies}
        onCreated={handleCreated}
      />

      {/* Detail sheet */}
      {detailRow && (
        <FreightDetailSheet
          row={detailRow}
          open={!!detailRow}
          onOpenChange={(v) => { if (!v) setDetailRow(null); }}
          onStatusChanged={handleCreated}
        />
      )}
    </>
  );
}
