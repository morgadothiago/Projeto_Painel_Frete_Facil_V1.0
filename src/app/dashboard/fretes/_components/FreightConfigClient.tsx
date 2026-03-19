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
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #E2E8F0",
      overflow: "hidden",
    }}>
      {/* Cabeçalho simulado do app do motorista */}
      <div style={{
        background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
        padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>{CLASS_EMOJI[vehicleType.vehicleClass] ?? "🚗"}</span>
        <div>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
            {vehicleType.name}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>
            Simulação — {distance}km
          </p>
        </div>
      </div>

      {/* Detalhamento */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <PreviewRow label="Preço base"          value={fmt(base)} />
        <PreviewRow label={`${distance}km × ${fmt(vehicleType.pricePerKm)}/km`} value={fmt(km)} />
        {config.minimumPrice > 0 && (base + km) < config.minimumPrice && (
          <PreviewRow label="Mínimo aplicado" value={fmt(config.minimumPrice)} highlight />
        )}
        <div style={{ borderTop: "1px dashed #E2E8F0", margin: "4px 0" }} />
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
        <div style={{ borderTop: "2px solid #E2E8F0", margin: "4px 0" }} />

        {/* O motorista recebe */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", borderRadius: 12,
          background: "linear-gradient(135deg,#E6FAF8,#F0FDFB)",
          border: "1.5px solid #2EC4B630",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0C6B64" }}>
            Motorista recebe
          </span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#0C6B64" }}>
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12.5, color: "#64748B" }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: bold ? 800 : 600,
        color: red ? "#EF4444" : green ? "#10B981" : highlight ? "#F59E0B" : "#0F172A",
      }}>
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

      {/* ── Coluna esquerda: configurações ──────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Taxas globais */}
        <Card title="Taxas Globais" icon={<Percent style={{ width: 16, height: 16, color: "#0C6B64" }} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
                Reembolso de pedágio
              </label>
              <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>
                Pedágio repassado ao motorista
              </p>
              <button
                type="button"
                onClick={() => setConf("tollReimburse", !config.tollReimburse)}
                style={{
                  width: 50, height: 28, borderRadius: 14,
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                  background: config.tollReimburse
                    ? "linear-gradient(135deg,#0C6B64,#2EC4B6)" : "#E2E8F0",
                  position: "relative",
                }}
              >
                <span style={{
                  position: "absolute", top: 3,
                  left: config.tollReimburse ? 24 : 4,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isPending}
            style={{
              marginTop: 8,
              display: "flex", alignItems: "center", gap: 7,
              padding: "11px 22px", borderRadius: 11, border: "none",
              background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(46,196,182,0.35)",
              alignSelf: "flex-start",
            }}
          >
            <Save style={{ width: 15, height: 15 }} />
            {isPending ? "Salvando…" : "Salvar configurações"}
          </button>
        </Card>

        {/* Preços por tipo de veículo */}
        <Card title="Preços por Tipo de Veículo" icon={<Truck style={{ width: 16, height: 16, color: "#0C6B64" }} />}>
          {vehicleTypes.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
              Nenhum tipo cadastrado. Crie em Tipos de Veículo.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {vehicleTypes.map((vt) => {
                const editing = editingPrices[vt.id];
                const cur     = editing ?? vt;
                const isDirty = !!editing;

                return (
                  <div key={vt.id} style={{
                    borderRadius: 14, border: isDirty ? "1.5px solid #2EC4B6" : "1.5px solid #F1F5F9",
                    background: isDirty ? "#F0FDFB" : "#FAFAFA",
                    padding: "14px 16px",
                    transition: "all 0.2s",
                  }}>
                    {/* Header do veículo */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{CLASS_EMOJI[vt.vehicleClass] ?? "🚗"}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{vt.name}</p>
                          {!vt.isActive && (
                            <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Inativo</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {isDirty && (
                          <button
                            onClick={() => handleSaveVtPricing(vt.id)}
                            disabled={isPending}
                            style={{
                              padding: "6px 14px", borderRadius: 8, border: "none",
                              background: "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                              color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            Salvar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setPreviewVt(vt);
                            if (!isDirty) startEditVt(vt);
                          }}
                          style={{
                            padding: "6px 12px", borderRadius: 8,
                            border: "1px solid #E2E8F0", background: "#fff",
                            fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          <Eye style={{ width: 12, height: 12 }} />
                          {isDirty ? "Editando" : "Editar"}
                        </button>
                      </div>
                    </div>

                    {/* Campos de preço */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      <MiniNumField label="Base (R$)"       value={cur.basePrice}           onChange={(v) => { startEditVt(vt); setVtField(vt.id, "basePrice", v); }} />
                      <MiniNumField label="Por km (R$)"     value={cur.pricePerKm}          onChange={(v) => { startEditVt(vt); setVtField(vt.id, "pricePerKm", v); }} />
                      <MiniNumField label="Ajudante (R$)"   value={cur.helperPrice}         onChange={(v) => { startEditVt(vt); setVtField(vt.id, "helperPrice", v); }} />
                      <MiniNumField label="Parada (R$)"     value={cur.additionalStopPrice} onChange={(v) => { startEditVt(vt); setVtField(vt.id, "additionalStopPrice", v); }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Coluna direita: preview ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
        <Card title="Preview — Como o motorista vê" icon={<Eye style={{ width: 16, height: 16, color: "#0C6B64" }} />}>
          {/* Seletor de veículo para preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                Simular com veículo
              </label>
              <select
                value={previewVt?.id ?? ""}
                onChange={(e) => setPreviewVt(vehicleTypes.find((v) => v.id === e.target.value) ?? null)}
                style={selectStyle}
              >
                {vehicleTypes.map((v) => (
                  <option key={v.id} value={v.id}>{CLASS_EMOJI[v.vehicleClass]} {v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                Distância (km): <strong>{previewDist}km</strong>
              </label>
              <input
                type="range" min={5} max={500} step={5}
                value={previewDist}
                onChange={(e) => setPreviewDist(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#2EC4B6" }}
              />
            </div>
          </div>

          {previewVt ? (
            <DriverPreview config={config} vehicleType={previewVt} distance={previewDist} />
          ) : (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              Selecione um tipo de veículo
            </div>
          )}

          <div style={{
            padding: "10px 12px", borderRadius: 10,
            background: "#FFF8E7", border: "1px solid #FDE68A",
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Info style={{ width: 14, height: 14, color: "#D97706", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 11.5, color: "#92400E", lineHeight: 1.5 }}>
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
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #E2E8F0",
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "#E6FAF8", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{title}</h2>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>{label}</label>
      {hint && <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{hint}</p>}
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 12.5, color: "#64748B", fontWeight: 600,
          }}>{prefix}</span>
        )}
        <input
          type="text" inputMode="decimal" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            ...inputStyle,
            paddingLeft: prefix ? 32 : 12,
            paddingRight: suffix ? 30 : 12,
          }}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 12.5, color: "#64748B", fontWeight: 600,
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function MiniNumField({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>{label}</label>
      <input
        type="text" inputMode="decimal" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...inputStyle, fontSize: 12.5, padding: "7px 8px" }}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", fontSize: 13.5, color: "#0F172A",
  background: "#F8FAFC", outline: "none", boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A",
  background: "#F8FAFC", outline: "none",
};
