"use client";

import { useState, useTransition } from "react";
import { toast }                   from "sonner";
import { Save, Percent, DollarSign, Truck, Eye, Info } from "lucide-react";
import {
  type FreightConfigData,
  type VehicleTypePricing,
  saveFreightConfig,
  saveVehicleTypePricing,
} from "@/app/actions/freightConfig";
import { cn } from "@/lib/utils";

const CLASS_EMOJI: Record<string, string> = {
  MOTO:            "🏍️",
  CARRO:           "🚗",
  VAN:             "🚐",
  CAMINHAO_LEVE:   "🚚",
  CAMINHAO_PESADO: "🚛",
};

// ── Preview de como o motorista vê ───────────────────────────────────────────

function DriverPreview({
  config,
  vehicleType,
  distance = 50,
}: {
  config: FreightConfigData;
  vehicleType: VehicleTypePricing;
  distance?: number;
}) {
  const base       = vehicleType.basePrice;
  const km         = vehicleType.pricePerKm * distance;
  const subtotal   = Math.max(base + km, config.minimumPrice);
  const platform   = subtotal * (config.platformFeePct / 100);
  const insurance  = subtotal * (config.insuranceFeePct / 100);
  const driverGets = subtotal - platform - insurance;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-border overflow-hidden">
      {/* Cabeçalho simulado do app do motorista */}
      <div className="bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] px-[18px] py-[14px] flex items-center gap-[10px]">
        <span className="text-[22px]">{CLASS_EMOJI[vehicleType.vehicleClass] ?? "🚗"}</span>
        <div>
          <p className="m-0 text-[13.5px] font-bold text-white">
            {vehicleType.name}
          </p>
          <p className="m-0 text-[11.5px] text-white/75">
            Simulação — {distance}km
          </p>
        </div>
      </div>

      {/* Detalhamento */}
      <div className="px-[18px] py-4 flex flex-col gap-2">
        <PreviewRow label="Preço base"          value={fmt(base)} />
        <PreviewRow label={`${distance}km × ${fmt(vehicleType.pricePerKm)}/km`} value={fmt(km)} />
        {config.minimumPrice > 0 && (base + km) < config.minimumPrice && (
          <PreviewRow label="Mínimo aplicado" value={fmt(config.minimumPrice)} highlight />
        )}
        <div className="border-t border-dashed border-border my-1" />
        <PreviewRow label="Subtotal do frete"   value={fmt(subtotal)} bold />
        <PreviewRow label={`Comissão plataforma (${config.platformFeePct}%)`} value={`- ${fmt(platform)}`} red />
        {config.insuranceFeePct > 0 && (
          <PreviewRow label={`Seguro (${config.insuranceFeePct}%)`} value={`- ${fmt(insurance)}`} red />
        )}
        {config.tollReimburse && (
          <PreviewRow label="Pedágio" value="+ reembolsado" green />
        )}
        {config.nightSurcharge > 0 && (
          <PreviewRow label={`Adicional noturno (${config.nightSurcharge}%)`} value={`+ ${fmt(subtotal * config.nightSurcharge / 100)}`} green />
        )}
        {config.weekendSurcharge > 0 && (
          <PreviewRow label={`Adicional fim de semana (${config.weekendSurcharge}%)`} value={`+ ${fmt(subtotal * config.weekendSurcharge / 100)}`} green />
        )}
        <div className="border-t-2 border-border my-1" />

        {/* O motorista recebe */}
        <div className="flex justify-between items-center px-[14px] py-3 rounded-xl bg-[linear-gradient(135deg,#E6FAF8,#F0FDFB)] border-[1.5px] border-[#2EC4B630]">
          <span className="text-[13px] font-bold text-primary-dark">
            Motorista recebe
          </span>
          <span className="text-[20px] font-black text-primary-dark">
            {fmt(driverGets)}
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value, bold, red, green, highlight }: {
  label: string; value: string;
  bold?: boolean; red?: boolean; green?: boolean; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-[13px]",
          bold      ? "font-extrabold" : "font-semibold",
          red       ? "text-red-500"   :
          green     ? "text-green-500" :
          highlight ? "text-orange-400":
                      "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function FreightConfigClient({
  initialConfig,
  initialVehicleTypes,
}: {
  initialConfig:      FreightConfigData;
  initialVehicleTypes: VehicleTypePricing[];
}) {
  const [config,       setConfig]       = useState<FreightConfigData>(initialConfig);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypePricing[]>(initialVehicleTypes);
  const [previewVt,    setPreviewVt]    = useState<VehicleTypePricing | null>(initialVehicleTypes[0] ?? null);
  const [previewDist,  setPreviewDist]  = useState(50);
  const [editingPrices, setEditingPrices] = useState<Record<string, VehicleTypePricing>>({});
  const [isPending, start] = useTransition();

  function setConf<K extends keyof FreightConfigData>(k: K, v: FreightConfigData[K]) {
    setConfig((p) => ({ ...p, [k]: v }));
  }

  function startEditVt(vt: VehicleTypePricing) {
    setEditingPrices((p) => ({ ...p, [vt.id]: { ...vt } }));
  }

  function setVtField(id: string, field: keyof VehicleTypePricing, val: number) {
    setEditingPrices((p) => ({ ...p, [id]: { ...p[id], [field]: val } }));
  }

  function handleSaveConfig() {
    start(async () => {
      const res = await saveFreightConfig(config);
      if (res.ok) toast.success("Configurações salvas!");
      else toast.error(res.error ?? "Erro");
    });
  }

  function handleSaveVtPricing(id: string) {
    const vt = editingPrices[id];
    if (!vt) return;
    start(async () => {
      const res = await saveVehicleTypePricing(id, {
        basePrice:           vt.basePrice,
        pricePerKm:          vt.pricePerKm,
        helperPrice:         vt.helperPrice,
        additionalStopPrice: vt.additionalStopPrice,
      });
      if (res.ok) {
        toast.success(`${vt.name} atualizado!`);
        setVehicleTypes((prev) => prev.map((v) => v.id === id ? { ...v, ...vt } : v));
        setEditingPrices((p) => { const n = { ...p }; delete n[id]; return n; });
      } else {
        toast.error("Erro ao salvar preços.");
      }
    });
  }

  return (
    // gridTemplateColumns uses a mixed template (1fr + fixed px), kept as inline style per spec
    <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "1fr 340px" }}>

      {/* ── Coluna esquerda: configurações ──────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Taxas globais */}
        <Card title="Taxas Globais" icon={<Percent className="w-4 h-4 text-primary-dark" />}>
          <div className="grid grid-cols-2 gap-[14px]">
            <NumField
              label="Comissão da plataforma (%)"
              hint="% cobrada sobre o valor do frete"
              value={config.platformFeePct}
              onChange={(v) => setConf("platformFeePct", v)}
              suffix="%"
            />
            <NumField
              label="Seguro (%)"
              hint="% adicional para seguro de carga"
              value={config.insuranceFeePct}
              onChange={(v) => setConf("insuranceFeePct", v)}
              suffix="%"
            />
            <NumField
              label="Valor mínimo (R$)"
              hint="Preço mínimo de qualquer frete"
              value={config.minimumPrice}
              onChange={(v) => setConf("minimumPrice", v)}
              prefix="R$"
            />
            <NumField
              label="Adicional noturno (%)"
              hint="% a mais entre 22h e 6h"
              value={config.nightSurcharge}
              onChange={(v) => setConf("nightSurcharge", v)}
              suffix="%"
            />
            <NumField
              label="Adicional fim de semana (%)"
              hint="% a mais em sábados e domingos"
              value={config.weekendSurcharge}
              onChange={(v) => setConf("weekendSurcharge", v)}
              suffix="%"
            />
            {/* Toggle pedágio */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12.5px] font-semibold text-slate-600">
                Reembolso de pedágio
              </label>
              <p className="m-0 text-[11.5px] text-slate-400">
                Pedágio repassado ao motorista
              </p>
              <button
                type="button"
                onClick={() => setConf("tollReimburse", !config.tollReimburse)}
                className="relative w-[50px] h-[28px] rounded-[14px] border-none cursor-pointer transition-all duration-200"
                style={{
                  background: config.tollReimburse
                    ? "linear-gradient(135deg,#0C6B64,#2EC4B6)"
                    : "#E2E8F0",
                }}
              >
                <span
                  className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-all duration-200"
                  style={{ left: config.tollReimburse ? 24 : 4 }}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isPending}
            className={cn(
              "mt-2 flex items-center gap-[7px] px-[22px] py-[11px] rounded-[11px] border-none bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white text-[14px] font-bold self-start shadow-[0_4px_14px_rgba(46,196,182,0.35)] transition-opacity",
              isPending ? "opacity-70 cursor-not-allowed" : "cursor-pointer opacity-100"
            )}
          >
            <Save className="w-[15px] h-[15px]" />
            {isPending ? "Salvando…" : "Salvar configurações"}
          </button>
        </Card>

        {/* Preços por tipo de veículo */}
        <Card title="Preços por Tipo de Veículo" icon={<Truck className="w-4 h-4 text-primary-dark" />}>
          {vehicleTypes.length === 0 ? (
            <p className="m-0 text-[13px] text-slate-400">
              Nenhum tipo cadastrado. Crie em Tipos de Veículo.
            </p>
          ) : (
            <div className="flex flex-col gap-[14px]">
              {vehicleTypes.map((vt) => {
                const editing = editingPrices[vt.id];
                const cur     = editing ?? vt;
                const isDirty = !!editing;

                return (
                  <div
                    key={vt.id}
                    className={cn(
                      "rounded-[14px] border-[1.5px] px-4 py-[14px] transition-all duration-200",
                      isDirty
                        ? "border-primary bg-[#F0FDFB]"
                        : "border-slate-100 bg-[#FAFAFA]"
                    )}
                  >
                    {/* Header do veículo */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-[10px]">
                        <span className="text-[24px]">{CLASS_EMOJI[vt.vehicleClass] ?? "🚗"}</span>
                        <div>
                          <p className="m-0 text-[14px] font-extrabold text-foreground">{vt.name}</p>
                          {!vt.isActive && (
                            <span className="text-[11px] text-slate-400 font-semibold">Inativo</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isDirty && (
                          <button
                            onClick={() => handleSaveVtPricing(vt.id)}
                            disabled={isPending}
                            className="px-[14px] py-[6px] rounded-lg border-none bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white text-[12.5px] font-bold cursor-pointer"
                          >
                            Salvar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPreviewVt(vt);
                            if (!isDirty) startEditVt(vt);
                          }}
                          className="px-3 py-[6px] rounded-lg border border-border bg-white text-[12px] font-semibold text-slate-600 cursor-pointer flex items-center gap-[5px]"
                        >
                          <Eye className="w-3 h-3" />
                          {isDirty ? "Editando" : "Editar"}
                        </button>
                      </div>
                    </div>

                    {/* Campos de preço */}
                    <div className="grid grid-cols-4 gap-[10px]">
                      <MiniNumField label="Base (R$)"     value={cur.basePrice}           onChange={(v) => { startEditVt(vt); setVtField(vt.id, "basePrice", v); }} />
                      <MiniNumField label="Por km (R$)"   value={cur.pricePerKm}          onChange={(v) => { startEditVt(vt); setVtField(vt.id, "pricePerKm", v); }} />
                      <MiniNumField label="Ajudante (R$)" value={cur.helperPrice}         onChange={(v) => { startEditVt(vt); setVtField(vt.id, "helperPrice", v); }} />
                      <MiniNumField label="Parada (R$)"   value={cur.additionalStopPrice} onChange={(v) => { startEditVt(vt); setVtField(vt.id, "additionalStopPrice", v); }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Coluna direita: preview ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sticky top-6">
        <Card title="Preview — Como o motorista vê" icon={<Eye className="w-4 h-4 text-primary-dark" />}>
          {/* Seletor de veículo para preview */}
          <div className="flex flex-col gap-[10px]">
            <div>
              <label className="text-[12px] font-semibold text-slate-600 block mb-[5px]">
                Simular com veículo
              </label>
              <select
                value={previewVt?.id ?? ""}
                onChange={(e) => setPreviewVt(vehicleTypes.find((v) => v.id === e.target.value) ?? null)}
                className={selectClass}
              >
                {vehicleTypes.map((v) => (
                  <option key={v.id} value={v.id}>{CLASS_EMOJI[v.vehicleClass]} {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-600 block mb-[5px]">
                Distância (km): <strong>{previewDist}km</strong>
              </label>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={previewDist}
                onChange={(e) => setPreviewDist(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {previewVt ? (
            <DriverPreview config={config} vehicleType={previewVt} distance={previewDist} />
          ) : (
            <div className="py-8 text-center text-slate-400 text-[13px]">
              Selecione um tipo de veículo
            </div>
          )}

          <div className="px-3 py-[10px] rounded-[10px] bg-[#FFF8E7] border border-[#FDE68A] flex gap-2 items-start">
            <Info className="w-[14px] h-[14px] text-amber-600 shrink-0 mt-[1px]" />
            <p className="m-0 text-[11.5px] text-amber-900 leading-[1.5]">
              Este é o preview exato que o motorista verá ao aceitar um frete. Ajuste as taxas e veja o impacto em tempo real.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-border px-[22px] py-5 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-primary-light flex items-center justify-center">
          {icon}
        </div>
        <h2 className="m-0 text-[15px] font-extrabold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function NumField({ label, hint, value, onChange, suffix, prefix }: {
  label: string; hint?: string; value: number;
  onChange: (v: number) => void; suffix?: string; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12.5px] font-semibold text-slate-600">{label}</label>
      {hint && <p className="m-0 text-[11px] text-slate-400">{hint}</p>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[12.5px] text-muted-foreground font-semibold">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={0}
          step={0.1}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            inputClass,
            prefix ? "pl-8" : "pl-3",
            suffix ? "pr-[30px]" : "pr-3"
          )}
        />
        {suffix && (
          <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[12.5px] text-muted-foreground font-semibold">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniNumField({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        step={0.01}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(inputClass, "text-[12.5px] px-2 py-[7px]")}
      />
    </div>
  );
}

const inputClass =
  "w-full px-3 py-[9px] rounded-[10px] border-[1.5px] border-border text-[13.5px] text-foreground bg-slate-50 outline-none box-border";

const selectClass =
  "w-full px-3 py-[9px] rounded-[10px] border-[1.5px] border-border text-[13px] text-foreground bg-slate-50 outline-none";
