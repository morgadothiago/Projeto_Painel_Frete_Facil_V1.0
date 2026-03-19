"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { toast }   from "sonner";
import { Package, MapPin, Navigation, Box } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  type CreateDeliveryPayload,
  createDelivery,
} from "@/app/actions/freight";
import type { VehicleTypeRow } from "@/app/actions/vehicleTypes";
import type { CompanyRow }     from "@/app/actions/companies";

// ── Constants ──────────────────────────────────────────────────────────────────

const VEHICLE_CLASSES: Record<string, string> = {
  MOTO:            "🏍️",
  CARRO:           "🚗",
  VAN:             "🚐",
  CAMINHAO_LEVE:   "🚚",
  CAMINHAO_PESADO: "🚛",
};

// ── Haversine ──────────────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Types ──────────────────────────────────────────────────────────────────────

type AddressFields = {
  zipCode:      string;
  street:       string;
  number:       string;
  neighborhood: string;
  city:         string;
  state:        string;
  lat:          number | null;
  lng:          number | null;
};

const EMPTY_ADDRESS: AddressFields = {
  zipCode: "", street: "", number: "", neighborhood: "",
  city: "", state: "", lat: null, lng: null,
};

type FormState = {
  companyId:     string;
  vehicleTypeId: string;
  origin:        AddressFields;
  destination:   AddressFields;
  cargoDescription: string;
  weight:           string;
  needsHelper:      boolean;
  additionalStops:  number;
  notes:            string;
  scheduledAt:      string;
  manualPrice:      string;
};

const EMPTY_FORM: FormState = {
  companyId: "", vehicleTypeId: "",
  origin:      { ...EMPTY_ADDRESS },
  destination: { ...EMPTY_ADDRESS },
  cargoDescription: "", weight: "",
  needsHelper: false, additionalStops: 0,
  notes: "", scheduledAt: "", manualPrice: "",
};

// ── Helper components ──────────────────────────────────────────────────────────

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", fontSize: 13.5, color: "#0F172A",
  background: "#F8FAFC", outline: "none", boxSizing: "border-box",
};

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{label}</span>
    </div>
  );
}

// ── CEP + Geocode helpers ──────────────────────────────────────────────────────

async function fetchViaCep(cep: string): Promise<{
  logradouro: string; bairro: string; localidade: string; uf: string;
} | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json() as { erro?: boolean; logradouro: string; bairro: string; localidade: string; uf: string };
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

async function geocode(
  street: string, number: string, city: string, state: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q   = encodeURIComponent(`${number} ${street}`);
    const url = `https://nominatim.openstreetmap.org/search?street=${q}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=Brazil&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "FretefacilApp/1.0" } });
    const arr = await res.json() as { lat: string; lon: string }[];
    if (!arr.length) return null;
    return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
  } catch {
    return null;
  }
}

// ── AddressSection ─────────────────────────────────────────────────────────────

function AddressSection({
  prefix,
  title,
  icon,
  value,
  onChange,
}: {
  prefix:   string;
  title:    string;
  icon:     React.ReactNode;
  value:    AddressFields;
  onChange: (v: AddressFields) => void;
}) {
  const [cepLoading, setCepLoading] = useState(false);

  function set<K extends keyof AddressFields>(k: K, v: AddressFields[K]) {
    onChange({ ...value, [k]: v });
  }

  async function handleCepBlur() {
    const clean = value.zipCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    const data = await fetchViaCep(clean);
    if (data) {
      const updated: AddressFields = {
        ...value,
        street:       data.logradouro || value.street,
        neighborhood: data.bairro      || value.neighborhood,
        city:         data.localidade  || value.city,
        state:        data.uf          || value.state,
        lat:          null, lng: null,
      };
      onChange(updated);

      // Try to geocode after short delay so state is settled
      const coords = await geocode(
        data.logradouro || value.street,
        value.number,
        data.localidade || value.city,
        data.uf         || value.state,
      );
      if (coords) {
        onChange({ ...updated, lat: coords.lat, lng: coords.lng });
      }
    } else {
      toast.error("CEP não encontrado.");
    }
    setCepLoading(false);
  }

  return (
    <div>
      <SectionTitle icon={icon} label={title} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* CEP */}
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
          <Field label="CEP" required>
            <div style={{ position: "relative" }}>
              <input
                id={`${prefix}-cep`}
                value={value.zipCode}
                onChange={(e) => set("zipCode", e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                maxLength={9}
                style={inputStyle}
              />
              {cepLoading && (
                <span style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", fontSize: 11,
                  color: "#2EC4B6", fontWeight: 600,
                }}>
                  buscando…
                </span>
              )}
            </div>
          </Field>
          <Field label="Número" required>
            <input
              value={value.number}
              onChange={(e) => set("number", e.target.value)}
              placeholder="123"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Rua */}
        <Field label="Logradouro" required>
          <input
            value={value.street}
            onChange={(e) => set("street", e.target.value)}
            placeholder="Rua, Av., etc."
            style={inputStyle}
          />
        </Field>

        {/* Bairro + Cidade */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Bairro" required>
            <input
              value={value.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              placeholder="Bairro"
              style={inputStyle}
            />
          </Field>
          <Field label="Cidade" required>
            <input
              value={value.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Cidade"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Estado + Coords indicator */}
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
          <Field label="UF" required>
            <input
              value={value.state}
              onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              style={inputStyle}
            />
          </Field>
          <Field label="Coordenadas">
            <div style={{
              ...inputStyle,
              color: value.lat ? "#065F46" : "#94A3B8",
              background: value.lat ? "#D1FAE5" : "#F8FAFC",
              border: `1.5px solid ${value.lat ? "#A7F3D0" : "#E2E8F0"}`,
              fontSize: 12,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Navigation style={{ width: 12, height: 12 }} />
              {value.lat
                ? `${value.lat.toFixed(5)}, ${value.lng?.toFixed(5)}`
                : "Não geocodificado"}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

// ── Price Summary ─────────────────────────────────────────────────────────────

function PriceSummary({
  vehicleType,
  origin,
  destination,
  needsHelper,
  additionalStops,
  manualPrice,
  onManualPrice,
}: {
  vehicleType:      VehicleTypeRow | null;
  origin:           AddressFields;
  destination:      AddressFields;
  needsHelper:      boolean;
  additionalStops:  number;
  manualPrice:      string;
  onManualPrice:    (v: string) => void;
}) {
  const hasCoords =
    origin.lat != null && origin.lng != null &&
    destination.lat != null && destination.lng != null;

  const distKm = hasCoords
    ? haversine(origin.lat!, origin.lng!, destination.lat!, destination.lng!)
    : null;

  const basePrice   = vehicleType?.basePrice           ?? 0;
  const perKm       = vehicleType?.pricePerKm          ?? 0;
  const helperPrice = vehicleType?.helperPrice         ?? 0;
  const stopPrice   = vehicleType?.additionalStopPrice ?? 0;

  const kmCost      = distKm != null ? distKm * perKm : 0;
  const helperCost  = needsHelper ? helperPrice : 0;
  const stopsCost   = additionalStops * stopPrice;
  const total       = basePrice + kmCost + helperCost + stopsCost;

  const manual      = parseFloat(manualPrice);
  const finalPrice  = !isNaN(manual) && manualPrice !== "" ? manual : total;

  function fmt(v: number) {
    return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div>
      <SectionTitle
        icon={<span style={{ fontSize: 11, fontWeight: 800 }}>R$</span>}
        label="Resumo de preços"
      />

      {/* Distance */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 10,
        background: "#F0FDFC", border: "1px solid #A7F3D0",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 12.5, color: "#065F46", fontWeight: 600 }}>Distância estimada</span>
        <span style={{ fontSize: 12.5, color: "#065F46", fontWeight: 800 }}>
          {distKm != null ? `${distKm.toFixed(1)} km` : "—"}
        </span>
      </div>

      {/* Breakdown */}
      <div style={{
        background: "#F8FAFC", borderRadius: 12, border: "1.5px solid #E2E8F0",
        padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
      }}>
        <PriceLine label="Base" value={basePrice} fmt={fmt} />
        {vehicleType && (
          <PriceLine
            label={`Por km ${distKm != null ? `(${distKm.toFixed(1)} km × R$ ${fmt(perKm)})` : `(R$ ${fmt(perKm)}/km)`}`}
            value={kmCost}
            fmt={fmt}
            muted={distKm == null}
          />
        )}
        {needsHelper && (
          <PriceLine label="Ajudante" value={helperCost} fmt={fmt} />
        )}
        {additionalStops > 0 && (
          <PriceLine
            label={`Paradas adicionais (${additionalStops} × R$ ${fmt(stopPrice)})`}
            value={stopsCost}
            fmt={fmt}
          />
        )}

        <div style={{ borderTop: "1px solid #E2E8F0", marginTop: 4, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Total estimado</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#0C6B64" }}>
            R$ {fmt(finalPrice)}
          </span>
        </div>
      </div>

      {/* Manual override */}
      <div style={{ marginTop: 12 }}>
        <Field label="Ajuste manual do preço (R$)">
          <input
            type="number"
            value={manualPrice}
            onChange={(e) => onManualPrice(e.target.value)}
            placeholder={`R$ ${fmt(total)} (automático)`}
            min={0}
            step={0.01}
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

function PriceLine({
  label, value, fmt, muted,
}: {
  label: string; value: number; fmt: (v: number) => string; muted?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12.5, color: muted ? "#94A3B8" : "#64748B", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: muted ? "#94A3B8" : "#0F172A" }}>
        {muted ? "—" : `R$ ${fmt(value)}`}
      </span>
    </div>
  );
}

// ── Main Sheet ─────────────────────────────────────────────────────────────────

export function FreightFormSheet({
  open,
  onOpenChange,
  vehicleTypes,
  companies,
  onCreated,
}: {
  open:          boolean;
  onOpenChange:  (v: boolean) => void;
  vehicleTypes:  VehicleTypeRow[];
  companies:     CompanyRow[];
  onCreated:     () => void;
}) {
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [isPending,  startTransition] = useTransition();

  const activeVehicleTypes = vehicleTypes.filter((vt) => vt.isActive);

  const selectedVehicleType = activeVehicleTypes.find((vt) => vt.id === form.vehicleTypeId) ?? null;

  // Reset on open
  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  // Computed price for submission
  const getEstimatedPrice = useCallback((): number | null => {
    const manual = parseFloat(form.manualPrice);
    if (!isNaN(manual) && form.manualPrice !== "") return manual;
    if (!selectedVehicleType) return null;

    const hasCoords =
      form.origin.lat != null && form.origin.lng != null &&
      form.destination.lat != null && form.destination.lng != null;

    const distKm = hasCoords
      ? haversine(form.origin.lat!, form.origin.lng!, form.destination.lat!, form.destination.lng!)
      : null;

    const base  = selectedVehicleType.basePrice;
    const km    = distKm != null ? distKm * selectedVehicleType.pricePerKm : 0;
    const help  = form.needsHelper ? selectedVehicleType.helperPrice : 0;
    const stops = form.additionalStops * selectedVehicleType.additionalStopPrice;
    return base + km + help + stops;
  }, [form, selectedVehicleType]);

  const getDistanceKm = useCallback((): number | null => {
    const { origin, destination } = form;
    if (
      origin.lat != null && origin.lng != null &&
      destination.lat != null && destination.lng != null
    ) {
      return haversine(origin.lat, origin.lng, destination.lat, destination.lng);
    }
    return null;
  }, [form]);

  // Validation
  const isValid =
    form.companyId &&
    form.vehicleTypeId &&
    form.origin.zipCode && form.origin.street && form.origin.number &&
    form.origin.neighborhood && form.origin.city && form.origin.state &&
    form.destination.zipCode && form.destination.street && form.destination.number &&
    form.destination.neighborhood && form.destination.city && form.destination.state;

  function handleSubmit() {
    if (!isValid) return;

    const distKm = getDistanceKm();
    const payload: CreateDeliveryPayload = {
      companyId:     form.companyId,
      vehicleTypeId: form.vehicleTypeId,

      originStreet:       form.origin.street,
      originNumber:       form.origin.number,
      originNeighborhood: form.origin.neighborhood,
      originCity:         form.origin.city,
      originState:        form.origin.state,
      originZipCode:      form.origin.zipCode,
      originLat:          form.origin.lat,
      originLng:          form.origin.lng,

      destinationStreet:       form.destination.street,
      destinationNumber:       form.destination.number,
      destinationNeighborhood: form.destination.neighborhood,
      destinationCity:         form.destination.city,
      destinationState:        form.destination.state,
      destinationZipCode:      form.destination.zipCode,
      destinationLat:          form.destination.lat,
      destinationLng:          form.destination.lng,

      cargoDescription:  form.cargoDescription,
      weight:            form.weight !== "" ? parseFloat(form.weight) : null,
      needsHelper:       form.needsHelper,
      additionalStops:   form.additionalStops,
      notes:             form.notes,
      scheduledAt:       form.scheduledAt || null,
      estimatedPrice:    getEstimatedPrice(),
      estimatedDistance: distKm,
      estimatedDuration: distKm != null ? Math.round((distKm / 50) * 60) : null,
    };

    startTransition(async () => {
      const res = await createDelivery(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Erro ao criar frete.");
        return;
      }
      toast.success("Frete criado com sucesso!");
      onCreated();
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{ width: 560, maxWidth: "100vw", padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
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
                Novo frete
              </SheetTitle>
              <SheetDescription style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, margin: 0 }}>
                Preencha os dados para criar um frete
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

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Section 1 - Empresa e Veículo */}
          <div>
            <SectionTitle icon={<Package style={{ width: 12, height: 12 }} />} label="Empresa e Veículo" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Empresa" required>
                <select
                  value={form.companyId}
                  onChange={(e) => set("companyId", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione a empresa…</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.tradeName ? ` — ${c.tradeName}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tipo de veículo" required>
                <select
                  value={form.vehicleTypeId}
                  onChange={(e) => set("vehicleTypeId", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione o tipo de veículo…</option>
                  {activeVehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>
                      {VEHICLE_CLASSES[vt.vehicleClass] ?? "🚗"} {vt.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Section 2 - Origem */}
          <AddressSection
            prefix="origin"
            title="Origem"
            icon={<MapPin style={{ width: 12, height: 12 }} />}
            value={form.origin}
            onChange={(v) => set("origin", v)}
          />

          {/* Section 3 - Destino */}
          <AddressSection
            prefix="destination"
            title="Destino"
            icon={<Navigation style={{ width: 12, height: 12 }} />}
            value={form.destination}
            onChange={(v) => set("destination", v)}
          />

          {/* Section 4 - Carga */}
          <div>
            <SectionTitle icon={<Box style={{ width: 12, height: 12 }} />} label="Carga e detalhes" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Descrição da carga">
                <input
                  value={form.cargoDescription}
                  onChange={(e) => set("cargoDescription", e.target.value)}
                  placeholder="Ex: Móveis, eletrodomésticos, caixas…"
                  style={inputStyle}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Peso (kg)">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    placeholder="0"
                    min={0}
                    step={0.1}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Paradas adicionais">
                  <input
                    type="number"
                    value={form.additionalStops}
                    onChange={(e) => set("additionalStops", Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                    min={0}
                    max={10}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Needs helper toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", borderRadius: 10,
                border: `1.5px solid ${form.needsHelper ? "#A7F3D0" : "#E2E8F0"}`,
                background: form.needsHelper ? "#F0FDFC" : "#F8FAFC",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
                onClick={() => set("needsHelper", !form.needsHelper)}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
                    Precisa de ajudante
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                    {selectedVehicleType && selectedVehicleType.helperPrice > 0
                      ? `+ R$ ${selectedVehicleType.helperPrice.toFixed(2)}`
                      : "Custo adicional conforme veículo"}
                  </p>
                </div>
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: form.needsHelper ? "linear-gradient(135deg, #0C6B64, #2EC4B6)" : "#E2E8F0",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute",
                    top: 2, left: form.needsHelper ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>

              {/* Observações */}
              <Field label="Observações">
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  placeholder="Informações adicionais para o motorista…"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>

              {/* Agendamento */}
              <Field label="Agendamento (opcional)">
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Section 5 - Price summary */}
          <PriceSummary
            vehicleType={selectedVehicleType}
            origin={form.origin}
            destination={form.destination}
            needsHelper={form.needsHelper}
            additionalStops={form.additionalStops}
            manualPrice={form.manualPrice}
            onManualPrice={(v) => set("manualPrice", v)}
          />

          {/* Bottom padding for footer */}
          <div style={{ height: 8 }} />
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #F1F5F9",
          display: "flex", gap: 10, justifyContent: "flex-end",
          flexShrink: 0,
          background: "#fff",
        }}>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            style={{
              padding: "10px 20px", borderRadius: 10,
              border: "1px solid #E2E8F0", background: "#F8FAFC",
              fontSize: 13.5, fontWeight: 600, color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !isValid}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: !isValid
                ? "#E2E8F0"
                : "linear-gradient(135deg, #0C6B64, #2EC4B6)",
              fontSize: 13.5, fontWeight: 700,
              color: !isValid ? "#94A3B8" : "#fff",
              cursor: (!isValid || isPending) ? "not-allowed" : "pointer",
              boxShadow: isValid ? "0 4px 14px rgba(46,196,182,0.35)" : "none",
              transition: "all 0.2s",
            }}
          >
            {isPending ? "Criando…" : "Criar frete"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
