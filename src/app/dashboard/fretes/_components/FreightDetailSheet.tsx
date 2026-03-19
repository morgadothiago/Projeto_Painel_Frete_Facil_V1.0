"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Package, MapPin, Navigation, User, Truck, Clock, Box } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  type DeliveryRow,
  type DeliveryStatus,
  updateDeliveryStatus,
  getDeliveries,
} from "@/app/actions/freight";

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pendente",      color: "#B45309", bg: "#FEF3C7" },
  ACCEPTED:   { label: "Aceito",        color: "#1D4ED8", bg: "#DBEAFE" },
  COLLECTING: { label: "Coletando",     color: "#7C3AED", bg: "#EDE9FE" },
  IN_TRANSIT: { label: "Em trânsito",   color: "#C2410C", bg: "#FFEDD5" },
  DELIVERED:  { label: "Entregue",      color: "#065F46", bg: "#D1FAE5" },
  CANCELLED:  { label: "Cancelado",     color: "#9F1239", bg: "#FFE4E6" },
  FAILED:     { label: "Falhou",        color: "#7F1D1D", bg: "#FEE2E2" },
};

const STATUS_FLOW: DeliveryStatus[] = [
  "PENDING", "ACCEPTED", "COLLECTING", "IN_TRANSIT", "DELIVERED",
];

const VEHICLE_CLASSES: Record<string, string> = {
  MOTO:            "🏍️",
  CARRO:           "🚗",
  VAN:             "🚐",
  CAMINHAO_LEVE:   "🚚",
  CAMINHAO_PESADO: "🚛",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 500 }}>
        {value || <span style={{ color: "#CBD5E1" }}>—</span>}
      </span>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#F8FAFC", borderRadius: 12,
      border: "1.5px solid #E2E8F0", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <span style={{ color: "#2EC4B6" }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
    </div>
  );
}

function AddressBlock({ prefix, row }: { prefix: "origin" | "destination"; row: DeliveryRow }) {
  const street = prefix === "origin" ? row.originStreet : row.destinationStreet;
  const number = prefix === "origin" ? row.originNumber : row.destinationNumber;
  const nbhd   = prefix === "origin" ? row.originNeighborhood : row.destinationNeighborhood;
  const city   = prefix === "origin" ? row.originCity : row.destinationCity;
  const state  = prefix === "origin" ? row.originState : row.destinationState;
  const zip    = prefix === "origin" ? row.originZipCode : row.destinationZipCode;

  return (
    <div>
      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
        {street}, {number}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#64748B" }}>
        {nbhd} · {city}/{state} · CEP {zip}
      </p>
    </div>
  );
}

// ── Status transition buttons ──────────────────────────────────────────────────

function StatusTransition({
  row,
  onChanged,
}: {
  row:       DeliveryRow;
  onChanged: () => void;
}) {
  const [isPending, start] = useTransition();

  const currentIdx = STATUS_FLOW.indexOf(row.status as DeliveryStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null;

  const isTerminal = row.status === "DELIVERED" || row.status === "CANCELLED" || row.status === "FAILED";

  if (isTerminal) {
    return (
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "#F1F5F9",
        fontSize: 13, color: "#64748B", fontWeight: 500, textAlign: "center",
      }}>
        Frete em estado final — nenhuma ação disponível.
      </div>
    );
  }

  function handleAdvance() {
    if (!nextStatus) return;
    start(async () => {
      const res = await updateDeliveryStatus(row.id, nextStatus);
      if (!res.ok) { toast.error(res.error ?? "Erro ao atualizar status."); return; }
      const cfg = STATUS_CONFIG[nextStatus];
      toast.success(`Status alterado para ${cfg.label}.`);
      onChanged();
    });
  }

  if (!nextStatus) return null;

  const cfg = STATUS_CONFIG[nextStatus];

  return (
    <button
      onClick={handleAdvance}
      disabled={isPending}
      style={{
        width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
        background: isPending ? "#E2E8F0" : "linear-gradient(135deg, #0C6B64, #2EC4B6)",
        color: isPending ? "#94A3B8" : "#fff",
        fontSize: 13.5, fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer",
        boxShadow: isPending ? "none" : "0 4px 14px rgba(46,196,182,0.3)",
        transition: "all 0.2s",
      }}
    >
      {isPending ? "Atualizando…" : `Avançar para: ${cfg.label}`}
    </button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function FreightDetailSheet({
  row,
  open,
  onOpenChange,
  onStatusChanged,
}: {
  row:             DeliveryRow;
  open:            boolean;
  onOpenChange:    (v: boolean) => void;
  onStatusChanged: () => void;
}) {
  const cfg = STATUS_CONFIG[row.status] ?? { label: row.status, color: "#64748B", bg: "#F1F5F9" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{ width: 520, maxWidth: "100vw", padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Gradient header */}
        <div style={{
          background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Package style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            <SheetHeader style={{ padding: 0 }}>
              <SheetTitle style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: 0 }}>
                Frete {row.publicId}
              </SheetTitle>
              <SheetDescription style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, margin: 0 }}>
                Detalhes e gerenciamento
              </SheetDescription>
            </SheetHeader>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "none", background: "rgba(255,255,255,0.2)",
              cursor: "pointer", fontSize: 18, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Status badge + publicId */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              display: "inline-flex", padding: "5px 14px", borderRadius: 20,
              fontSize: 13, fontWeight: 800,
              background: cfg.bg, color: cfg.color,
            }}>
              {cfg.label}
            </span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              Criado em {new Date(row.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          {/* Status flow */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {STATUS_FLOW.map((s, i) => {
              const si   = STATUS_FLOW.indexOf(row.status as DeliveryStatus);
              const done = si >= i;
              const curr = si === i;
              const sc   = STATUS_CONFIG[s];
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_FLOW.length - 1 ? 1 : undefined }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done
                      ? (curr ? sc.bg : "#D1FAE5")
                      : "#F1F5F9",
                    border: curr ? `2px solid ${sc.color}` : done ? "2px solid #A7F3D0" : "2px solid #E2E8F0",
                    fontSize: 10, fontWeight: 800,
                    color: done ? (curr ? sc.color : "#065F46") : "#94A3B8",
                  }}>
                    {i + 1}
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: done && si > i ? "#A7F3D0" : "#E2E8F0",
                      margin: "0 2px",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Empresa + Driver */}
          <SectionCard>
            <SectionLabel icon={<User style={{ width: 13, height: 13 }} />} label="Partes envolvidas" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoRow label="Empresa" value={row.companyName} />
              <InfoRow label="Motorista" value={row.driverName ?? "Não atribuído"} />
            </div>
          </SectionCard>

          {/* Veículo */}
          <SectionCard>
            <SectionLabel icon={<Truck style={{ width: 13, height: 13 }} />} label="Veículo" />
            <InfoRow
              label="Tipo"
              value={`${VEHICLE_CLASSES[row.vehicleClass] ?? "🚗"} ${row.vehicleTypeName}`}
            />
          </SectionCard>

          {/* Endereços */}
          <SectionCard>
            <SectionLabel icon={<MapPin style={{ width: 13, height: 13 }} />} label="Origem" />
            <AddressBlock prefix="origin" row={row} />
          </SectionCard>
          <SectionCard>
            <SectionLabel icon={<Navigation style={{ width: 13, height: 13 }} />} label="Destino" />
            <AddressBlock prefix="destination" row={row} />
          </SectionCard>

          {/* Carga */}
          <SectionCard>
            <SectionLabel icon={<Box style={{ width: 13, height: 13 }} />} label="Carga" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoRow label="Descrição" value={row.cargoDescription ?? "—"} />
              <InfoRow label="Peso" value={row.weight != null ? `${row.weight} kg` : "—"} />
              <InfoRow label="Ajudante" value={row.needsHelper ? "Sim" : "Não"} />
              <InfoRow label="Paradas adicionais" value={String(row.additionalStops)} />
            </div>
            {row.notes && (
              <InfoRow label="Observações" value={row.notes} />
            )}
            {row.scheduledAt && (
              <InfoRow label="Agendado para" value={new Date(row.scheduledAt).toLocaleString("pt-BR")} />
            )}
          </SectionCard>

          {/* Valores */}
          <SectionCard>
            <SectionLabel icon={<Clock style={{ width: 13, height: 13 }} />} label="Valores e estimativas" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoRow
                label="Preço estimado"
                value={row.estimatedPrice != null ? `R$ ${fmt(row.estimatedPrice)}` : "—"}
              />
              <InfoRow
                label="Preço final"
                value={row.finalPrice != null ? `R$ ${fmt(row.finalPrice)}` : "—"}
              />
              <InfoRow
                label="Distância"
                value={row.estimatedDistance != null ? `${row.estimatedDistance.toFixed(1)} km` : "—"}
              />
              <InfoRow
                label="Duração estimada"
                value={row.estimatedDuration != null ? `${row.estimatedDuration} min` : "—"}
              />
            </div>
          </SectionCard>
        </div>

        {/* Footer with status transition */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #F1F5F9",
          background: "#fff",
          flexShrink: 0,
        }}>
          <StatusTransition row={row} onChanged={onStatusChanged} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
