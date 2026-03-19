"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Power, PowerOff,
  Truck, Car, Weight, Package,
} from "lucide-react";
import {
  type VehicleTypeRow,
  type VehicleTypePayload,
  getVehicleTypes,
  createVehicleType,
  updateVehicleType,
  toggleVehicleTypeActive,
  deleteVehicleType,
} from "@/app/actions/vehicleTypes";

// ── Constantes ────────────────────────────────────────────────────────────────

const VEHICLE_CLASSES = [
  { value: "MOTO",           label: "Moto",           emoji: "🏍️" },
  { value: "CARRO",          label: "Carro",           emoji: "🚗" },
  { value: "VAN",            label: "Van",             emoji: "🚐" },
  { value: "CAMINHAO_LEVE",  label: "Caminhão Leve",  emoji: "🚚" },
  { value: "CAMINHAO_PESADO",label: "Caminhão Pesado", emoji: "🚛" },
];

const SIZES = [
  { value: "PEQUENO", label: "Pequeno", color: "#10B981" },
  { value: "MEDIO",   label: "Médio",   color: "#F59E0B" },
  { value: "GRANDE",  label: "Grande",  color: "#EF4444" },
];

const CATEGORIES = [
  { value: "EXPRESSO",     label: "Expresso",     color: "#6366F1" },
  { value: "PADRAO",       label: "Padrão",       color: "#2EC4B6" },
  { value: "PREMIUM",      label: "Premium",      color: "#F59E0B" },
  { value: "CARGA_PESADA", label: "Carga Pesada", color: "#EF4444" },
];

const ICONS = [
  { value: "motorcycle", label: "Moto"     },
  { value: "car",        label: "Carro"    },
  { value: "van",        label: "Van"      },
  { value: "truck",      label: "Caminhão" },
];

const EMPTY: VehicleTypePayload = {
  name: "", icon: "car", description: "",
  vehicleClass: "CARRO", size: "MEDIO", category: "PADRAO",
  maxWeight: 0, basePrice: 0, pricePerKm: 0,
  helperPrice: 0, additionalStopPrice: 0,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function classLabel(v: string)    { return VEHICLE_CLASSES.find((c) => c.value === v)?.label ?? v; }
function classEmoji(v: string)    { return VEHICLE_CLASSES.find((c) => c.value === v)?.emoji ?? "🚗"; }
function sizeLabel(v: string)     { return SIZES.find((s) => s.value === v)?.label ?? v; }
function sizeColor(v: string)     { return SIZES.find((s) => s.value === v)?.color ?? "#64748B"; }
function categoryLabel(v: string) { return CATEGORIES.find((c) => c.value === v)?.label ?? v; }
function categoryColor(v: string) { return CATEGORIES.find((c) => c.value === v)?.color ?? "#64748B"; }

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: `${color}14`, color,
      border: `1px solid ${color}25`,
    }}>
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ editing, onClose, onSaved }: {
  editing: VehicleTypeRow | null;
  onClose: () => void;
  onSaved: (rows: VehicleTypeRow[]) => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<VehicleTypePayload>(
    isEdit ? {
      name: editing.name, icon: editing.icon,
      description: editing.description ?? "",
      vehicleClass: editing.vehicleClass, size: editing.size,
      category: editing.category, maxWeight: editing.maxWeight,
      basePrice: editing.basePrice, pricePerKm: editing.pricePerKm,
      helperPrice: editing.helperPrice,
      additionalStopPrice: editing.additionalStopPrice,
    } : EMPTY,
  );
  const [pending, startTransition] = useTransition();

  function set<K extends keyof VehicleTypePayload>(k: K, v: VehicleTypePayload[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function submit() {
    startTransition(async () => {
      const res = isEdit
        ? await updateVehicleType(editing.id, form)
        : await createVehicleType(form);
      if (!res.ok) { toast.error(res.error ?? "Erro ao salvar"); return; }
      toast.success(isEdit ? "Tipo atualizado!" : "Tipo criado com sucesso!");
      const updated = await getVehicleTypes();
      onSaved(updated);
      onClose();
    });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 560,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 24px 18px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Car style={{ width: 17, height: 17, color: "#fff" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                {isEdit ? "Editar tipo" : "Novo tipo de veículo"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
                Preencha os dados do tipo de veículo
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: "none", background: "#F8FAFC",
            cursor: "pointer", fontSize: 16, color: "#64748B",
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Nome do tipo *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Van Baú" style={inputStyle} />
          </Field>

          <Field label="Tipo de veículo *">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VEHICLE_CLASSES.map((c) => (
                <button key={c.value} type="button" onClick={() => set("vehicleClass", c.value)}
                  style={{
                    padding: "7px 14px", borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    border: form.vehicleClass === c.value ? "2px solid #0C6B64" : "2px solid #E2E8F0",
                    background: form.vehicleClass === c.value ? "#E6FAF8" : "#F8FAFC",
                    color: form.vehicleClass === c.value ? "#0C6B64" : "#64748B",
                  }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tamanho *">
              <div style={{ display: "flex", gap: 6 }}>
                {SIZES.map((s) => (
                  <button key={s.value} type="button" onClick={() => set("size", s.value)}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 9, cursor: "pointer",
                      fontSize: 12.5, fontWeight: 700, transition: "all 0.15s",
                      border: form.size === s.value ? `2px solid ${s.color}` : "2px solid #E2E8F0",
                      background: form.size === s.value ? `${s.color}18` : "#F8FAFC",
                      color: form.size === s.value ? s.color : "#64748B",
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Categoria *">
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                style={inputStyle}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Ícone">
              <select value={form.icon} onChange={(e) => set("icon", e.target.value)}
                style={inputStyle}>
                {ICONS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Peso máximo (kg) *">
              <input type="text" inputMode="decimal" value={form.maxWeight}
                onChange={(e) => set("maxWeight", Number(e.target.value))}
                placeholder="0" style={inputStyle} />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2} placeholder="Descreva o tipo de veículo…"
              style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Precificação
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Preço base (R$)">
                <input type="text" inputMode="decimal" value={form.basePrice}
                  onChange={(e) => set("basePrice", Number(e.target.value))} style={inputStyle} />
              </Field>
              <Field label="Preço por km (R$)">
                <input type="text" inputMode="decimal" value={form.pricePerKm}
                  onChange={(e) => set("pricePerKm", Number(e.target.value))} style={inputStyle} />
              </Field>
              <Field label="Ajudante (R$)">
                <input type="text" inputMode="decimal" value={form.helperPrice}
                  onChange={(e) => set("helperPrice", Number(e.target.value))} style={inputStyle} />
              </Field>
              <Field label="Parada adicional (R$)">
                <input type="text" inputMode="decimal" value={form.additionalStopPrice}
                  onChange={(e) => set("additionalStopPrice", Number(e.target.value))} style={inputStyle} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #F1F5F9",
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button onClick={onClose} disabled={pending} style={{
            padding: "10px 20px", borderRadius: 10,
            border: "1px solid #E2E8F0", background: "#F8FAFC",
            fontSize: 13.5, fontWeight: 600, color: "#475569", cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button onClick={submit} disabled={pending || !form.name} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: !form.name ? "#E2E8F0" : "linear-gradient(135deg,#0C6B64,#2EC4B6)",
            fontSize: 13.5, fontWeight: 700, color: !form.name ? "#94A3B8" : "#fff",
            cursor: !form.name ? "not-allowed" : "pointer",
            boxShadow: form.name ? "0 4px 14px rgba(46,196,182,0.35)" : "none",
          }}>
            {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar tipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", fontSize: 13.5, color: "#0F172A",
  background: "#F8FAFC", outline: "none", boxSizing: "border-box",
};

// ── Componente principal ──────────────────────────────────────────────────────

export function VehicleTypesClient({ initialData }: { initialData: VehicleTypeRow[] }) {
  const [rows,      setRows]    = useState(initialData);
  const [modal,     setModal]   = useState<"create" | VehicleTypeRow | null>(null);
  const [isPending, start]      = useTransition();

  async function handleToggle(row: VehicleTypeRow) {
    start(async () => {
      const res = await toggleVehicleTypeActive(row.id, !row.isActive);
      if (res.ok) {
        toast.success(`${row.name} ${!row.isActive ? "ativado" : "desativado"}.`);
        setRows(await getVehicleTypes());
      }
    });
  }

  async function handleDelete(row: VehicleTypeRow) {
    if (!confirm(`Excluir "${row.name}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      const res = await deleteVehicleType(row.id);
      if (res.ok) {
        toast.success("Tipo excluído.");
        setRows(await getVehicleTypes());
      } else {
        toast.error(res.error ?? "Erro ao excluir.");
      }
    });
  }

  const active   = rows.filter((r) => r.isActive).length;
  const inactive = rows.filter((r) => !r.isActive).length;

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: "#0C6B64",
            background: "#0C6B6412", border: "1px solid #0C6B6420",
            padding: "4px 10px", borderRadius: 20,
          }}>
            {active} ativo{active !== 1 ? "s" : ""}
          </span>
          {inactive > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 600, color: "#94A3B8",
              background: "#F1F5F9", border: "1px solid #E2E8F0",
              padding: "4px 10px", borderRadius: 20,
            }}>
              {inactive} inativo{inactive !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => setModal("create")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11, border: "none",
            background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(46,196,182,0.30)",
          }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo tipo
        </button>
      </div>

      {/* Grid de cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 14,
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
        overflowY: "auto",
      }}>
        {rows.map((row) => (
          <VehicleCard
            key={row.id}
            row={row}
            onEdit={() => setModal(row)}
            onToggle={() => handleToggle(row)}
            onDelete={() => handleDelete(row)}
          />
        ))}

        {rows.length === 0 && (
          <div style={{
            gridColumn: "1/-1", padding: "60px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <Car style={{ width: 36, height: 36, color: "#CBD5E1" }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              Nenhum tipo cadastrado
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
              Clique em "Novo tipo" para começar.
            </p>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={setRows}
        />
      )}
    </>
  );
}

// ── VehicleCard ───────────────────────────────────────────────────────────────

function VehicleCard({ row, onEdit, onToggle, onDelete }: {
  row:      VehicleTypeRow;
  onEdit:   () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: row.isActive ? "1px solid #F1F5F9" : "1px dashed #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      padding: "18px 20px",
      opacity: row.isActive ? 1 : 0.65,
      transition: "all 0.2s",
      display: "flex", flexDirection: "column", gap: 14,
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: row.isActive ? "#0C6B6412" : "#F1F5F9",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            {classEmoji(row.vehicleClass)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>
              {row.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#94A3B8" }}>
              {classLabel(row.vehicleClass)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <IconBtn title="Editar" onClick={onEdit}>
            <Pencil style={{ width: 13, height: 13 }} />
          </IconBtn>
          <IconBtn
            title={row.isActive ? "Desativar" : "Ativar"}
            onClick={onToggle}
            color={row.isActive ? "#EF4444" : "#10B981"}
          >
            {row.isActive
              ? <PowerOff style={{ width: 13, height: 13 }} />
              : <Power    style={{ width: 13, height: 13 }} />
            }
          </IconBtn>
          <IconBtn title="Excluir" onClick={onDelete} color="#EF4444">
            <Trash2 style={{ width: 13, height: 13 }} />
          </IconBtn>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Chip label={sizeLabel(row.size)}         color={sizeColor(row.size)} />
        <Chip label={categoryLabel(row.category)} color={categoryColor(row.category)} />
        {!row.isActive && <Chip label="Inativo" color="#94A3B8" />}
      </div>

      {/* Stats */}
      <div style={{
        display: "flex",
        gap: 0,
        borderTop: "1px solid #F8FAFC",
        paddingTop: 14,
      }}>
        <StatItem icon={<Weight  style={{ width: 12, height: 12 }} />} label="Peso máx." value={`${row.maxWeight}kg`} />
        <div style={{ width: 1, background: "#F1F5F9", margin: "0 12px" }} />
        <StatItem icon={<Truck   style={{ width: 12, height: 12 }} />} label="Veículos"  value={String(row._count.vehicles)} />
        <div style={{ width: 1, background: "#F1F5F9", margin: "0 12px" }} />
        <StatItem icon={<Package style={{ width: 12, height: 12 }} />} label="Fretes"    value={String(row._count.deliveries)} />
      </div>

      {/* Preços */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 6,
        borderTop: "1px solid #F8FAFC",
        paddingTop: 14,
      }}>
        <PriceRow label="Base"     value={row.basePrice} />
        <PriceRow label="Por km"   value={row.pricePerKm} />
        <PriceRow label="Ajudante" value={row.helperPrice} />
        <PriceRow label="Parada"   value={row.additionalStopPrice} />
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function IconBtn({ children, onClick, title, color = "#64748B" }: {
  children: React.ReactNode;
  onClick:  () => void;
  title:    string;
  color?:   string;
}) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8,
      border: "1px solid #F1F5F9", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color, transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8", marginBottom: 3 }}>
        {icon}
        <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.3px" }}>{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 10px", borderRadius: 8, background: "#F8FAFC",
    }}>
      <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }}>
        {value > 0 ? `R$ ${value.toFixed(2)}` : "—"}
      </span>
    </div>
  );
}
