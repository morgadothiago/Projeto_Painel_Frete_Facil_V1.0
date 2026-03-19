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
import { cn } from "@/lib/utils";

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

// Chip uses runtime-dynamic colors derived from data, so inline style is kept
function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-[10px] py-[2px] rounded-[20px] text-[11.5px] font-semibold border"
      style={{
        background: `${color}18`,
        color,
        borderColor: `${color}30`,
      }}
    >
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
    <div
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[20px] w-full max-w-[560px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-[22px] pb-[18px] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] flex items-center justify-center">
              <Car className="w-[17px] h-[17px] text-white" />
            </div>
            <div>
              <h2 className="m-0 text-base font-extrabold text-slate-900">
                {isEdit ? "Editar tipo" : "Novo tipo de veículo"}
              </h2>
              <p className="m-0 text-xs text-slate-400 mt-[1px]">
                Preencha os dados do tipo de veículo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-none bg-slate-50 cursor-pointer text-base text-slate-500"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Nome */}
          <Field label="Nome do tipo *">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Van Baú"
              className={inputClass}
            />
          </Field>

          {/* Tipo de veículo */}
          <Field label="Tipo de veículo *">
            <div className="flex gap-2 flex-wrap">
              {VEHICLE_CLASSES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set("vehicleClass", c.value)}
                  className={cn(
                    "px-[14px] py-[7px] rounded-[10px] cursor-pointer text-[13px] font-semibold transition-all duration-150 border-2",
                    form.vehicleClass === c.value
                      ? "border-primary-dark bg-[#E6FAF8] text-primary-dark"
                      : "border-border bg-slate-50 text-muted-foreground"
                  )}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Tamanho + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tamanho *">
              <div className="flex gap-[6px]">
                {/* Size buttons use runtime-dynamic colors from data, keep inline style for color-dependent props */}
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("size", s.value)}
                    className="flex-1 py-[7px] rounded-[9px] cursor-pointer text-[12.5px] font-bold transition-all duration-150 border-2"
                    style={{
                      border: form.size === s.value ? `2px solid ${s.color}` : "2px solid #E2E8F0",
                      background: form.size === s.value ? `${s.color}18` : "#F8FAFC",
                      color: form.size === s.value ? s.color : "#64748B",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Categoria *">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Ícone + Peso */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ícone">
              <select
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className={inputClass}
              >
                {ICONS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Peso máximo (kg) *">
              <input
                type="number"
                value={form.maxWeight}
                onChange={(e) => set("maxWeight", Number(e.target.value))}
                min={0}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Descrição */}
          <Field label="Descrição">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Descreva o tipo de veículo…"
              className={cn(inputClass, "resize-y")}
            />
          </Field>

          {/* Preços */}
          <div>
            <p className="m-0 mb-[10px] text-[12px] font-bold text-slate-400 uppercase tracking-[0.06em]">
              Precificação
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço base (R$)">
                <input
                  type="number"
                  value={form.basePrice}
                  min={0}
                  step={0.01}
                  onChange={(e) => set("basePrice", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Preço por km (R$)">
                <input
                  type="number"
                  value={form.pricePerKm}
                  min={0}
                  step={0.01}
                  onChange={(e) => set("pricePerKm", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Ajudante (R$)">
                <input
                  type="number"
                  value={form.helperPrice}
                  min={0}
                  step={0.01}
                  onChange={(e) => set("helperPrice", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Parada adicional (R$)">
                <input
                  type="number"
                  value={form.additionalStopPrice}
                  min={0}
                  step={0.01}
                  onChange={(e) => set("additionalStopPrice", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-[10px] justify-end">
          <button
            onClick={onClose}
            disabled={pending}
            className="px-5 py-[10px] rounded-[10px] border border-border bg-slate-50 text-[13.5px] font-semibold text-slate-600 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={pending || !form.name}
            className={cn(
              "px-6 py-[10px] rounded-[10px] border-none text-[13.5px] font-bold transition-all",
              form.name
                ? "bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white cursor-pointer shadow-[0_4px_14px_rgba(46,196,182,0.35)]"
                : "bg-border text-slate-400 cursor-not-allowed"
            )}
          >
            {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar tipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[12.5px] font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-[9px] rounded-[10px] border-[1.5px] border-border text-[13.5px] text-foreground bg-slate-50 outline-none box-border";

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
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[13px] text-muted-foreground">
          {rows.filter((r) => r.isActive).length} ativos · {rows.filter((r) => !r.isActive).length} inativos
        </p>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-[7px] px-[18px] py-[10px] rounded-[11px] border-none bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white text-[13.5px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(46,196,182,0.35)]"
        >
          <Plus className="w-[15px] h-[15px]" />
          Novo tipo
        </button>
      </div>

      {/* Cards grid */}
      <div
        className={cn(
          "grid gap-4 transition-opacity duration-200",
          isPending ? "opacity-60" : "opacity-100"
        )}
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              "bg-white rounded-2xl px-5 py-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200",
              row.isActive
                ? "border-[1.5px] border-border opacity-100"
                : "border-[1.5px] border-dashed border-border opacity-60"
            )}
          >
            {/* Card header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-[44px] h-[44px] rounded-[13px] shrink-0 flex items-center justify-center text-[22px]",
                    row.isActive
                      ? "bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)]"
                      : "bg-slate-100"
                  )}
                >
                  {classEmoji(row.vehicleClass)}
                </div>
                <div>
                  <p className="m-0 text-[15px] font-extrabold text-foreground">
                    {row.name}
                  </p>
                  <p className="m-0 text-xs text-slate-400 mt-[1px]">
                    {classLabel(row.vehicleClass)}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-[6px]">
                <IconBtn title="Editar" onClick={() => setModal(row)}>
                  <Pencil className="w-[13px] h-[13px]" />
                </IconBtn>
                <IconBtn
                  title={row.isActive ? "Desativar" : "Ativar"}
                  onClick={() => handleToggle(row)}
                  color={row.isActive ? "#EF4444" : "#10B981"}
                >
                  {row.isActive
                    ? <PowerOff className="w-[13px] h-[13px]" />
                    : <Power    className="w-[13px] h-[13px]" />
                  }
                </IconBtn>
                <IconBtn title="Excluir" onClick={() => handleDelete(row)} color="#EF4444">
                  <Trash2 className="w-[13px] h-[13px]" />
                </IconBtn>
              </div>
            </div>

            {/* Chips */}
            <div className="flex gap-[6px] flex-wrap mb-3">
              <Chip label={sizeLabel(row.size)}         color={sizeColor(row.size)} />
              <Chip label={categoryLabel(row.category)} color={categoryColor(row.category)} />
              {!row.isActive && <Chip label="Inativo" color="#94A3B8" />}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100">
              <Stat icon={<Weight  className="w-3 h-3" />} label="Peso máx." value={`${row.maxWeight}kg`} />
              <Stat icon={<Truck   className="w-3 h-3" />} label="Veículos"   value={String(row._count.vehicles)} />
              <Stat icon={<Package className="w-3 h-3" />} label="Fretes"     value={String(row._count.deliveries)} />
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-[6px] mt-[10px]">
              <PriceRow label="Base"     value={row.basePrice} />
              <PriceRow label="Por km"   value={row.pricePerKm} />
              <PriceRow label="Ajudante" value={row.helperPrice} />
              <PriceRow label="Parada"   value={row.additionalStopPrice} />
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="col-span-full py-[60px] flex flex-col items-center gap-3">
            <Car className="w-9 h-9 text-slate-300" />
            <p className="m-0 text-[15px] font-bold text-foreground">
              Nenhum tipo cadastrado
            </p>
            <p className="m-0 text-[13px] text-muted-foreground">
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
    <button
      title={title}
      onClick={onClick}
      className="w-[30px] h-[30px] rounded-lg border border-border bg-slate-50 flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{ color }}
    >
      {children}
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-[2px]">
        {icon}
        <span className="text-[10.5px] font-semibold">{label}</span>
      </div>
      <p className="m-0 text-[14px] font-extrabold text-foreground">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center px-[10px] py-[5px] rounded-lg bg-slate-50">
      <span className="text-[11.5px] text-muted-foreground font-medium">{label}</span>
      <span className="text-[12.5px] font-bold text-foreground">
        {value > 0 ? `R$ ${value.toFixed(2)}` : "—"}
      </span>
    </div>
  );
}
