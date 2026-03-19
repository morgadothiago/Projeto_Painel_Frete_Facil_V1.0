"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Power, PowerOff,
  Truck, Car, Bike, Package, Weight,
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
  { value: "MOTO",           label: "Moto",            emoji: "🏍️" },
  { value: "CARRO",          label: "Carro",            emoji: "🚗" },
  { value: "VAN",            label: "Van",              emoji: "🚐" },
  { value: "CAMINHAO_LEVE",  label: "Caminhão Leve",   emoji: "🚚" },
  { value: "CAMINHAO_PESADO",label: "Caminhão Pesado",  emoji: "🚛" },
];

const SIZES = [
  { value: "PEQUENO", label: "Pequeno", color: "#10B981" },
  { value: "MEDIO",   label: "Médio",   color: "#F59E0B" },
  { value: "GRANDE",  label: "Grande",  color: "#EF4444" },
];

const CATEGORIES = [
  { value: "EXPRESSO",     label: "Expresso",      color: "#6366F1" },
  { value: "PADRAO",       label: "Padrão",        color: "#2EC4B6" },
  { value: "PREMIUM",      label: "Premium",       color: "#F59E0B" },
  { value: "CARGA_PESADA", label: "Carga Pesada",  color: "#EF4444" },
];

const ICONS = [
  { value: "motorcycle", label: "Moto"   },
  { value: "car",        label: "Carro"  },
  { value: "van",        label: "Van"    },
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
      fontSize: 11.5, fontWeight: 600,
      background: `${color}18`, color,
      border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  editing, onClose, onSaved,
}: {
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
      // Busca lista atualizada e repassa ao pai
      const updated = await getVehicleTypes();
      onSaved(updated);
      onClose();
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560,
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
              <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
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

          {/* Nome */}
          <Field label="Nome do tipo *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Van Baú" style={inputStyle} />
          </Field>

          {/* Tipo de veículo */}
          <Field label="Tipo de veículo *">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VEHICLE_CLASSES.map((c) => (
                <button key={c.value} type="button"
                  onClick={() => set("vehicleClass", c.value)}
                  style={{
                    padding: "7px 14px", borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    border: form.vehicleClass === c.value
                      ? "2px solid #0C6B64" : "2px solid #E2E8F0",
                    background: form.vehicleClass === c.value ? "#E6FAF8" : "#F8FAFC",
                    color: form.vehicleClass === c.value ? "#0C6B64" : "#64748B",
                  }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Tamanho + Categoria */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tamanho *">
              <div style={{ display: "flex", gap: 6 }}>
                {SIZES.map((s) => (
                  <button key={s.value} type="button"
                    onClick={() => set("size", s.value)}
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

          {/* Ícone + Peso */}
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
              <input type="number" value={form.maxWeight}
                onChange={(e) => set("maxWeight", Number(e.target.value))}
                min={0} placeholder="0" style={inputStyle} />
            </Field>
          </div>

          {/* Descrição */}
          <Field label="Descrição">
            <textarea value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2} placeholder="Descreva o tipo de veículo…"
              style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          {/* Preços */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Precificação
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Preço base (R$)">
                <input type="number" value={form.basePrice} min={0} step={0.01}
                  onChange={(e) => set("basePrice", Number(e.target.value))}
                  style={inputStyle} />
              </Field>
              <Field label="Preço por km (R$)">
                <input type="number" value={form.pricePerKm} min={0} step={0.01}
                  onChange={(e) => set("pricePerKm", Number(e.target.value))}
                  style={inputStyle} />
              </Field>
              <Field label="Ajudante (R$)">
                <input type="number" value={form.helperPrice} min={0} step={0.01}
                  onChange={(e) => set("helperPrice", Number(e.target.value))}
                  style={inputStyle} />
              </Field>
              <Field label="Parada adicional (R$)">
                <input type="number" value={form.additionalStopPrice} min={0} step={0.01}
                  onChange={(e) => set("additionalStopPrice", Number(e.target.value))}
                  style={inputStyle} />
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

// ── Tabela principal ──────────────────────────────────────────────────────────

export function VehicleTypesClient({ initialData }: { initialData: VehicleTypeRow[] }) {
  const [rows,    setRows]    = useState(initialData);
  const [modal,   setModal]   = useState<"create" | VehicleTypeRow | null>(null);
  const [isPending, start]    = useTransition();

  async function handleToggle(row: VehicleTypeRow) {
    start(async () => {
      const res = await toggleVehicleTypeActive(row.id, !row.isActive);
      if (res.ok) {
        toast.success(`${row.name} ${!row.isActive ? "ativado" : "desativado"}.`);
        const updated = await getVehicleTypes();
        setRows(updated);
      }
    });
  }

  async function handleDelete(row: VehicleTypeRow) {
    if (!confirm(`Excluir "${row.name}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      const res = await deleteVehicleType(row.id);
      if (res.ok) {
        toast.success("Tipo excluído.");
        const updated = await getVehicleTypes();
        setRows(updated);
      } else {
        toast.error(res.error ?? "Erro ao excluir.");
      }
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
          {rows.filter((r) => r.isActive).length} ativos · {rows.filter((r) => !r.isActive).length} inativos
        </p>
        <button
          onClick={() => setModal("create")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11, border: "none",
            background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(46,196,182,0.35)",
          }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo tipo
        </button>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}>
        {rows.map((row) => (
          <div key={row.id} style={{
            background: "#fff", borderRadius: 16,
            border: row.isActive ? "1.5px solid #E2E8F0" : "1.5px dashed #E2E8F0",
            padding: "18px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            opacity: row.isActive ? 1 : 0.6,
            transition: "all 0.2s",
          }}>
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: row.isActive
                    ? "linear-gradient(135deg,#0C6B64,#2EC4B6)"
                    : "#F1F5F9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  {classEmoji(row.vehicleClass)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
                    {row.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
                    {classLabel(row.vehicleClass)}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: "flex", gap: 6 }}>
                <IconBtn title="Editar" onClick={() => setModal(row)}>
                  <Pencil style={{ width: 13, height: 13 }} />
                </IconBtn>
                <IconBtn
                  title={row.isActive ? "Desativar" : "Ativar"}
                  onClick={() => handleToggle(row)}
                  color={row.isActive ? "#EF4444" : "#10B981"}
                >
                  {row.isActive
                    ? <PowerOff style={{ width: 13, height: 13 }} />
                    : <Power    style={{ width: 13, height: 13 }} />
                  }
                </IconBtn>
                <IconBtn title="Excluir" onClick={() => handleDelete(row)} color="#EF4444">
                  <Trash2 style={{ width: 13, height: 13 }} />
                </IconBtn>
              </div>
            </div>

            {/* Chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <Chip label={sizeLabel(row.size)}     color={sizeColor(row.size)} />
              <Chip label={categoryLabel(row.category)} color={categoryColor(row.category)} />
              {!row.isActive && <Chip label="Inativo" color="#94A3B8" />}
            </div>

            {/* Stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8, padding: "12px 0", borderTop: "1px solid #F1F5F9",
            }}>
              <Stat icon={<Weight style={{ width: 12, height: 12 }} />} label="Peso máx." value={`${row.maxWeight}kg`} />
              <Stat icon={<Truck  style={{ width: 12, height: 12 }} />} label="Veículos" value={String(row._count.vehicles)} />
              <Stat icon={<Package style={{ width: 12, height: 12 }} />} label="Fretes" value={String(row._count.deliveries)} />
            </div>

            {/* Preços */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 6, marginTop: 10,
            }}>
              <PriceRow label="Base"       value={row.basePrice} />
              <PriceRow label="Por km"     value={row.pricePerKm} />
              <PriceRow label="Ajudante"   value={row.helperPrice} />
              <PriceRow label="Parada"     value={row.additionalStopPrice} />
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div style={{
            gridColumn: "1/-1", padding: "60px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <Car style={{ width: 36, height: 36, color: "#CBD5E1" }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              Nenhum tipo cadastrado
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
              Clique em "Novo tipo" para começar.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
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

function IconBtn({ children, onClick, title, color = "#475569" }: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  color?: string;
}) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8,
      border: "1px solid #E2E8F0", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color, transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "#94A3B8", marginBottom: 2 }}>
        {icon}
        <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "5px 10px", borderRadius: 8, background: "#F8FAFC",
    }}>
      <span style={{ fontSize: 11.5, color: "#64748B", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }}>
        {value > 0 ? `R$ ${value.toFixed(2)}` : "—"}
      </span>
    </div>
  );
}
