"use client";

import { useState, useTransition } from "react";
import {
  Calculator, Truck, Users, MapPin, Clock,
  Info, ChevronRight, RotateCcw,
} from "lucide-react";
import {
  type VehicleTypeOption,
  type EstimateResult,
  estimateFreight,
} from "@/app/actions/simulate";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CLASS_EMOJI: Record<string, string> = {
  MOTO:            "🏍️",
  CARRO:           "🚗",
  VAN:             "🚐",
  CAMINHAO_LEVE:   "🚚",
  CAMINHAO_PESADO: "🚛",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  vehicleTypeId:   string;
  distanceKm:      string;
  needsHelper:     boolean;
  additionalStops: number;
  scheduledAt:     string;
};

const INITIAL_FORM: FormState = {
  vehicleTypeId:   "",
  distanceKm:      "",
  needsHelper:     false,
  additionalStops: 0,
  scheduledAt:     "",
};

// ─── Linha do breakdown ───────────────────────────────────────────────────────

function Row({
  label, value, sub, bold, red, green, yellow,
}: {
  label: string; value: string; sub?: boolean;
  bold?: boolean; red?: boolean; green?: boolean; yellow?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      paddingLeft: sub ? 10 : 0,
      borderLeft: sub ? "2px solid #F1F5F9" : "none",
    }}>
      <span style={{ fontSize: sub ? 12.5 : 13, color: sub ? "#94A3B8" : "#64748B" }}>
        {label}
      </span>
      <span style={{
        fontSize: bold ? 13.5 : 13, fontWeight: bold ? 800 : 600,
        color: red ? "#EF4444" : green ? "#10B981" : yellow ? "#F59E0B" : "#0F172A",
      }}>
        {value}
      </span>
    </div>
  );
}

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <div style={{
      height: 1, margin: "2px 0",
      background: dashed
        ? "repeating-linear-gradient(90deg,#E2E8F0 0,#E2E8F0 4px,transparent 4px,transparent 8px)"
        : "#F1F5F9",
    }} />
  );
}

// ─── Painel de resultado ──────────────────────────────────────────────────────

function ResultPanel({ result }: { result: EstimateResult }) {
  const { breakdown: b, config: c, estimatedPrice, driverEarnings } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, animation: "fadeUp .28s ease" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,#0C6B64 0%,#1a9e96 60%,#2EC4B6 100%)",
        borderRadius: "16px 16px 0 0",
        padding: "20px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            {result.vehicleType.icon ?? "🚚"}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff" }}>
              {result.vehicleType.name}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              {result.distanceKm} km estimados
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 10.5, color: "rgba(255,255,255,0.65)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total do frete
          </p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginTop: 2 }}>
            {fmt(estimatedPrice)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #E2E8F0", borderTop: "none",
        borderRadius: "0 0 16px 16px",
        padding: "18px 22px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {/* Composição */}
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Composição
        </p>

        <Row label="Preço base" value={fmt(b.basePrice)} />
        <Row label={`Distância · ${result.distanceKm} km`} value={fmt(b.distanceFee)} sub />
        {b.helperFee > 0 && <Row label="Ajudante" value={fmt(b.helperFee)} sub />}
        {b.stopsFee  > 0 && <Row label="Paradas adicionais" value={fmt(b.stopsFee)} sub />}
        {b.nightSurchargeFee   > 0 && <Row label={`Adicional noturno (${c.nightSurcharge}%)`}   value={`+ ${fmt(b.nightSurchargeFee)}`}   green sub />}
        {b.weekendSurchargeFee > 0 && <Row label={`Adicional fim de semana (${c.weekendSurcharge}%)`} value={`+ ${fmt(b.weekendSurchargeFee)}`} green sub />}
        {b.minimumPriceApplied && <Row label="Preço mínimo aplicado" value={fmt(c.minimumPrice)} yellow />}

        <Divider dashed />
        <Row label="Subtotal cobrado" value={fmt(estimatedPrice)} bold />

        <Divider />

        {/* Taxas */}
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Taxas
        </p>

        <Row label={`Comissão plataforma (${c.platformFeePct}%)`} value={`- ${fmt(b.platformFee)}`} red />
        {b.insuranceFee > 0 && <Row label={`Seguro (${c.insuranceFeePct}%)`} value={`- ${fmt(b.insuranceFee)}`} red />}
        {c.tollReimburse && <Row label="Pedágio" value="+ reembolsado" green />}

        <Divider />

        {/* Driver earnings */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 15px", borderRadius: 12,
          background: "linear-gradient(135deg,#E6FAF8,#F0FDFB)",
          border: "1.5px solid rgba(46,196,182,0.2)",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0C6B64" }}>
              Motorista recebe
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#64748B", marginTop: 1 }}>
              Após taxas da plataforma
            </p>
          </div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#0C6B64" }}>
            {fmt(driverEarnings)}
          </span>
        </div>

        {/* Note */}
        <div style={{
          display: "flex", gap: 7, alignItems: "flex-start",
          padding: "9px 11px", borderRadius: 9,
          background: "#FFFBEB", border: "1px solid #FDE68A",
        }}>
          <Info style={{ width: 13, height: 13, color: "#D97706", flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 11.5, color: "#92400E", lineHeight: 1.55 }}>
            Estimativa baseada nas taxas configuradas pelo admin. Valor final pode variar com pedágios.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder (antes de calcular) ─────────────────────────────────────────

function EmptyPanel() {
  return (
    <div style={{
      border: "1.5px dashed #E2E8F0", borderRadius: 16,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 12, padding: "48px 24px",
      background: "#FAFBFC",
      minHeight: 320,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: "linear-gradient(135deg,#E6FAF8,#d0f4f0)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Calculator style={{ width: 24, height: 24, color: "#0C6B64" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
          Resultado aparece aqui
        </p>
        <p style={{ margin: "5px 0 0", fontSize: 12.5, color: "#94A3B8", lineHeight: 1.5 }}>
          Preencha o formulário e clique em<br />
          <strong style={{ color: "#0C6B64" }}>Calcular estimativa</strong>
        </p>
      </div>
      <div style={{
        display: "flex", flexDirection: "column", gap: 7, width: "100%", maxWidth: 220,
      }}>
        {["Valor total do frete", "Taxas da plataforma", "Ganho do motorista"].map((item) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", borderRadius: 9,
            background: "#fff", border: "1px solid #F1F5F9",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2EC4B6", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#64748B" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label="toggle"
      style={{
        width: 42, height: 23, borderRadius: 12, border: "none",
        cursor: "pointer", transition: "background 0.18s", flexShrink: 0,
        background: on ? "linear-gradient(135deg,#0C6B64,#2EC4B6)" : "#E2E8F0",
        position: "relative",
      }}
    >
      <span style={{
        position: "absolute", top: 2.5,
        left: on ? 21 : 2.5,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        transition: "left 0.18s",
        display: "block",
      }} />
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SimularFreteClient({ vehicleTypes }: { vehicleTypes: VehicleTypeOption[] }) {
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);
  const [result,  setResult]  = useState<EstimateResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedVt = vehicleTypes.find((v) => v.id === form.vehicleTypeId);

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  }

  function handleCalcular() {
    if (!form.vehicleTypeId) { setError("Selecione um tipo de veículo."); return; }
    const km = parseFloat(form.distanceKm);
    if (!form.distanceKm || isNaN(km) || km <= 0) { setError("Informe uma distância válida em km."); return; }
    setError(null);
    startTransition(async () => {
      const res = await estimateFreight({
        vehicleTypeId:   form.vehicleTypeId,
        distanceKm:      km,
        needsHelper:     form.needsHelper,
        additionalStops: form.additionalStops,
        scheduledAt:     form.scheduledAt || undefined,
      });
      if (res.ok) setResult(res.data);
      else setError(res.error);
    });
  }

  const canSubmit = !isPending && vehicleTypes.length > 0;

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .vt-card:hover     { border-color: #2EC4B6 !important; background: #F0FDFB !important; }
        .sim-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); }
        .sim-btn:active:not(:disabled){ transform:translateY(0); }
        .reset-btn:hover   { border-color:#CBD5E1 !important; background:#F8FAFC !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input:focus        { border-color:#2EC4B6 !important; box-shadow:0 0 0 3px rgba(46,196,182,0.12) !important; }
      `}</style>

      {/* ── Grid root ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,400px)",
        gap: 20,
        alignItems: "start",
      }}
        className="sim-grid"
      >
        <style>{`
          @media (max-width: 860px) {
            .sim-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* ── Formulário ──────────────────────────────────────────────────── */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1.5px solid #E2E8F0",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column", gap: 24,
        }}>

          {/* Veículos */}
          <section>
            <Label icon={<Truck size={13} />} text="Tipo de veículo" />
            <div style={{ height: 10 }} />
            {vehicleTypes.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
                Nenhum tipo de veículo cadastrado.
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
                gap: 8,
              }}>
                {vehicleTypes.map((vt) => {
                  const active = form.vehicleTypeId === vt.id;
                  return (
                    <button
                      key={vt.id}
                      type="button"
                      className="vt-card"
                      onClick={() => setField("vehicleTypeId", vt.id)}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 5,
                        padding: "14px 8px 12px",
                        borderRadius: 12,
                        border: active ? "2px solid #2EC4B6" : "1.5px solid #E8ECF0",
                        background: active ? "#E6FAF8" : "#FAFBFC",
                        cursor: "pointer", transition: "all 0.15s",
                        boxShadow: active ? "0 0 0 3px rgba(46,196,182,0.13)" : "none",
                      }}
                    >
                      <span style={{ fontSize: 24, lineHeight: 1 }}>
                        {CLASS_EMOJI[vt.vehicleClass] ?? vt.icon ?? "🚚"}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: active ? 700 : 500,
                        color: active ? "#0C6B64" : "#475569",
                        textAlign: "center", lineHeight: 1.3,
                      }}>
                        {vt.name}
                      </span>
                      {vt.maxWeight != null && (
                        <span style={{ fontSize: 10.5, color: "#94A3B8" }}>
                          até {vt.maxWeight}kg
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedVt && (
              <div style={{
                marginTop: 10, fontSize: 12, color: "#64748B",
                padding: "7px 11px", background: "#F8FAFC",
                borderRadius: 8, border: "1px solid #F1F5F9",
                display: "flex", gap: 12,
              }}>
                <span>Base <strong style={{ color: "#0F172A" }}>{fmt(selectedVt.basePrice)}</strong></span>
                <span style={{ color: "#E2E8F0" }}>|</span>
                <span>Por km <strong style={{ color: "#0F172A" }}>{fmt(selectedVt.pricePerKm)}</strong></span>
                {selectedVt.maxWeight && (
                  <>
                    <span style={{ color: "#E2E8F0" }}>|</span>
                    <span>Máx. <strong style={{ color: "#0F172A" }}>{selectedVt.maxWeight}kg</strong></span>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Distância */}
          <section>
            <Label icon={<MapPin size={13} />} text="Distância estimada" />
            <div style={{ height: 10 }} />
            <div style={{ position: "relative" }}>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ex: 25"
                min={0.1}
                step={0.1}
                value={form.distanceKm}
                onChange={(e) => setField("distanceKm", e.target.value)}
                style={{
                  width: "100%", padding: "11px 46px 11px 14px",
                  borderRadius: 10, border: "1.5px solid #E2E8F0",
                  fontSize: 14, color: "#0F172A", background: "#FAFBFC",
                  outline: "none", boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
                }}
              />
              <span style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12, fontWeight: 700, color: "#94A3B8", pointerEvents: "none",
              }}>
                km
              </span>
            </div>
          </section>

          {/* Opções adicionais */}
          <section>
            <Label icon={<Users size={13} />} text="Opções adicionais" />
            <div style={{ height: 10 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

              {/* Ajudante */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: 10,
                border: "1.5px solid #E8ECF0", background: "#FAFBFC",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Ajudante</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Aux. de carga</p>
                </div>
                <Toggle on={form.needsHelper} onChange={() => setField("needsHelper", !form.needsHelper)} />
              </div>

              {/* Paradas */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: 10,
                border: "1.5px solid #E8ECF0", background: "#FAFBFC",
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Paradas</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Pontos extras</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <StepBtn
                    label="−"
                    onClick={() => setField("additionalStops", Math.max(0, form.additionalStops - 1))}
                    disabled={form.additionalStops === 0}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", minWidth: 18, textAlign: "center" }}>
                    {form.additionalStops}
                  </span>
                  <StepBtn label="+" onClick={() => setField("additionalStops", form.additionalStops + 1)} />
                </div>
              </div>
            </div>
          </section>

          {/* Agendamento */}
          <section>
            <Label icon={<Clock size={13} />} text="Agendamento" optional />
            <div style={{ height: 10 }} />
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setField("scheduledAt", e.target.value)}
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: 10, border: "1.5px solid #E2E8F0",
                fontSize: 13.5, color: "#0F172A", background: "#FAFBFC",
                outline: "none", boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
              }}
            />
            <p style={{ margin: "7px 0 0", fontSize: 11.5, color: "#94A3B8" }}>
              Entregas entre 20h–6h ou fins de semana podem ter adicional.
            </p>
          </section>

          {/* Erro */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "#FEF2F2", border: "1px solid #FECACA",
              fontSize: 13, color: "#DC2626", fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: "flex", gap: 8, marginTop: -4 }}>
            <button
              type="button"
              className="sim-btn"
              onClick={handleCalcular}
              disabled={!canSubmit}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "13px 20px", borderRadius: 11, border: "none",
                background: !canSubmit
                  ? "#E2E8F0"
                  : "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                color: !canSubmit ? "#94A3B8" : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: !canSubmit ? "not-allowed" : "pointer",
                boxShadow: !canSubmit ? "none" : "0 4px 14px rgba(46,196,182,0.3)",
                transition: "all 0.15s",
              }}
            >
              {isPending ? (
                <>
                  <span style={{
                    width: 15, height: 15, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff",
                    animation: "spin 0.65s linear infinite", display: "inline-block", flexShrink: 0,
                  }} />
                  Calculando…
                </>
              ) : (
                <>
                  <Calculator size={15} />
                  Calcular estimativa
                  <ChevronRight size={15} />
                </>
              )}
            </button>

            {(result || form.vehicleTypeId || form.distanceKm) && (
              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
                title="Limpar formulário"
                style={{
                  padding: "13px 14px", borderRadius: 11,
                  border: "1.5px solid #E2E8F0", background: "#fff",
                  cursor: "pointer", color: "#94A3B8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Painel direito ─────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 20 }}>
          {result ? <ResultPanel result={result} /> : <EmptyPanel />}
        </div>
      </div>
    </>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Label({ icon, text, optional }: { icon: React.ReactNode; text: string; optional?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 21, height: 21, borderRadius: 6,
        background: "#E6FAF8",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#0C6B64",
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{text}</span>
      {optional && (
        <span style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginLeft: 2 }}>
          (opcional)
        </span>
      )}
    </div>
  );
}

function StepBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 26, height: 26, borderRadius: 7, border: "1.5px solid #E2E8F0",
        background: "#fff", cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 500, color: "#475569",
        opacity: disabled ? 0.35 : 1, transition: "opacity 0.15s",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

