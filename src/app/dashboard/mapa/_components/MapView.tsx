"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMapData, type MapData } from "@/app/actions/map";
import { simulateDriverNear }       from "@/app/actions/dev";
import { toast }                    from "sonner";
import { Truck, Package, RefreshCw, MapPin, FlaskConical } from "lucide-react";
import { useIsMobile }              from "@/hooks/use-mobile";

// ── Ícones personalizados ──────────────────────────────────────────────────────
// NOTE: L.divIcon uses innerHTML HTML strings — Tailwind classes have no effect
// here, so inline CSS inside template literals is intentional and must stay as-is.

const driverIcon = L.divIcon({
  className: "",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width:40px;height:40px;border-radius:50%;
        background:linear-gradient(135deg,#0C6B64,#2EC4B6);
        border:3px solid #fff;
        box-shadow:0 3px 10px rgba(12,107,100,0.45);
        display:flex;align-items:center;justify-content:center;
        font-size:20px;
      ">🚗</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid #0C6B64;
      "></div>
    </div>`,
  iconSize:   [40, 52],
  iconAnchor: [20, 52],
  popupAnchor:[0, -54],
});

function createCarIcon(_heading: number): L.DivIcon {
  return driverIcon;
}

const deliveryIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;height:34px;border-radius:10px;
      background:linear-gradient(135deg,#F59E0B,#FBBF24);
      border:3px solid #fff;
      box-shadow:0 3px 10px rgba(245,158,11,0.45);
      display:flex;align-items:center;justify-content:center;
      font-size:15px;
    ">📦</div>`,
  iconSize:   [34, 34],
  iconAnchor: [17, 17],
  popupAnchor:[0, -20],
});

const myLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(66,133,244,0.2);
        animation:pulse-blue 2s infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:14px;height:14px;border-radius:50%;
        background:#4285F4;
        border:2.5px solid #fff;
        box-shadow:0 2px 8px rgba(66,133,244,0.6);
      "></div>
    </div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
  popupAnchor:[0, -14],
});

type MyLocation = { lat: number; lng: number } | null;

// ── Fly to my location ────────────────────────────────────────────────────────

function FlyToLocation({ location }: { location: MyLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], 16, { duration: 1.4 });
  }, [location, map]);
  return null;
}

// ── Auto-fit bounds — só roda UMA vez no primeiro carregamento ────────────────

function FitBounds({ data, locked }: { data: MapData; locked: boolean }) {
  const map    = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (locked || didFit.current) return;

    const points: [number, number][] = [
      ...data.drivers.map((d)    => [d.lat, d.lng]            as [number, number]),
      ...data.deliveries.map((d) => [d.originLat, d.originLng] as [number, number]),
    ];
    if (points.length === 0) return;

    didFit.current = true;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [data, locked, map]);

  return null;
}

// ── Componente principal ───────────────────────────────────────────────────────

export function MapView() {
  const [data,        setData]      = useState<MapData>({ drivers: [], deliveries: [] });
  const [loading,     setLoading]   = useState(true);
  const [lastSync,    setLastSync]  = useState<Date | null>(null);
  const [myLocation,  setMyLocation]  = useState<MyLocation>(null);
  const [locating,    setLocating]    = useState(false);
  const [simulating,  setSimulating]  = useState(false);
  const knownDriverIds = useRef<Set<string>>(new Set());
  const isMobile       = useIsMobile();

  async function refresh() {
    const result = await getMapData();
    setData(result);
    setLastSync(new Date());
    setLoading(false);
    result.drivers.forEach((d) => knownDriverIds.current.add(d.id));
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minHeight: 0 }}>

      {/* ── Barra de controles ── */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: 10, flexShrink: 0 }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10 }}>
          <MapStatCard
            icon={<Truck style={{ width: 15, height: 15, color: "#0C6B64" }} />}
            label="Motoristas livres"
            value={data.drivers.length}
            color="#0C6B64"
            isMobile={isMobile}
          />
          <MapStatCard
            icon={<Package style={{ width: 15, height: 15, color: "#D97706" }} />}
            label="Entregas pendentes"
            value={data.deliveries.length}
            color="#D97706"
            isMobile={isMobile}
          />
        </div>

        {/* Separador */}
        {!isMobile && <div style={{ flex: 1 }} />}

        {/* Botões container */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {/* Botão me localizar */}
          <ActionButton
            onClick={() => {
              if (!navigator.geolocation) return;
              setLocating(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  setLocating(false);
                },
                () => setLocating(false),
                { enableHighAccuracy: true },
              );
            }}
            icon={<MapPin style={{ width: 13, height: 13 }} />}
            label={locating ? "Buscando…" : myLocation ? "Localizado" : "Me localizar"}
            active={!!myLocation}
            activeColor="#1D4ED8"
            activeBg="#EFF6FF"
            activeBorder="#BFDBFE"
          />

          {/* Simular motorista */}
          {myLocation && (
            <ActionButton
              onClick={async () => {
                setSimulating(true);
                const res = await simulateDriverNear(myLocation.lat, myLocation.lng);
                if (res.ok) {
                  toast.success("Motorista simulado perto de você!", {
                    description: `${res.name} aparecerá no mapa em instantes.`,
                  });
                  await refresh();
                } else {
                  toast.error("Nenhum motorista encontrado no banco para simular.");
                }
                setSimulating(false);
              }}
              icon={<FlaskConical style={{ width: 13, height: 13 }} />}
              label={simulating ? "Simulando…" : "Simular motorista"}
              disabled={simulating}
              activeColor="#7C3AED"
              activeBg="#FAF5FF"
              activeBorder="#DDD6FE"
              active
            />
          )}

          {/* Atualizar */}
          <ActionButton
            onClick={refresh}
            icon={<RefreshCw style={{ width: 13, height: 13 }} />}
            label="Atualizar"
          />

          {/* Timestamp */}
          {lastSync && (
            <span suppressHydrationWarning style={{ fontSize: 11.5, color: "#94A3B8", whiteSpace: "nowrap", marginLeft: isMobile ? 0 : "auto", marginTop: isMobile ? 4 : 0 }}>
              Atualizado às {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* ── Card do mapa ── */}
      <div style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        overflow: "hidden",
        flex: 1,
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Legenda no topo do card */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: isMobile ? 12 : 18,
          padding: isMobile ? "10px 12px" : "10px 16px",
          borderBottom: "1px solid #F8FAFC",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Legenda
          </span>
          <LegendItem emoji="🚗" label="Motorista livre" />
          <LegendItem emoji="📦" label="Entrega pendente" />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-block", width: 10, height: 10, borderRadius: "50%",
              background: "#4285F4", border: "2px solid #fff",
              boxShadow: "0 0 0 3px rgba(66,133,244,0.25)",
            }} />
            <span style={{ fontSize: 12, color: "#64748B" }}>Minha localização</span>
          </div>
        </div>

        {/* Mapa */}
        <div style={{ flex: 1, position: "relative" }}>
          {loading ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              background: "#F8FAFC",
            }}>
              <MapPin style={{ width: 28, height: 28, color: "#CBD5E1" }} />
              <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>Carregando mapa…</p>
            </div>
          ) : (
            <MapContainer
              center={[-23.55, -46.63]}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds data={data} locked={!!myLocation} />
              <FlyToLocation location={myLocation} />

              {myLocation && (
                <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocationIcon} zIndexOffset={1000}>
                  <Popup>
                    <div style={{ minWidth: 140 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13 }}>📍 Você está aqui</p>
                      <p style={{ margin: 0, fontSize: 11.5, color: "#555" }}>
                        {myLocation.lat.toFixed(5)}, {myLocation.lng.toFixed(5)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {data.drivers.map((driver) => (
                <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={createCarIcon(driver.heading)}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>🚛 {driver.name}</p>
                      {driver.vehicle && (
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>Veículo: {driver.vehicle}</p>
                      )}
                      {driver.plate && (
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>Placa: <b>{driver.plate}</b></p>
                      )}
                      {driver.phone && (
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>Tel: {driver.phone}</p>
                      )}
                      <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#0C6B64", fontWeight: 600 }}>
                        ⭐ {driver.rating.toFixed(1)} · Livre
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {data.deliveries.map((delivery) => (
                <Marker key={delivery.id} position={[delivery.originLat, delivery.originLng]} icon={deliveryIcon}>
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>📦 #{delivery.publicId}</p>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>Empresa: {delivery.company}</p>
                      {delivery.description && (
                        <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>Carga: {delivery.description}</p>
                      )}
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                        {delivery.originCity} → {delivery.destCity}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#D97706", fontWeight: 600 }}>
                        Aguardando motorista
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!loading && data.drivers.length === 0 && data.deliveries.length === 0 && (
        <div style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          fontSize: 13,
          color: "#92400E",
          textAlign: "center",
          flexShrink: 0,
        }}>
          Nenhum motorista online ou entrega pendente com coordenadas no momento.
        </div>
      )}

    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function MapStatCard({ icon, label, value, color, isMobile }: {
  icon:  React.ReactNode;
  label: string;
  value: number;
  color: string;
  isMobile?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 8 : 10,
      flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "12px" : "10px 16px",
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      flex: 1,
    }}>
      <div style={{
        width: isMobile ? 28 : 34, height: isMobile ? 28 : 34, borderRadius: 9, flexShrink: 0,
        background: `${color}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ transform: isMobile ? "scale(0.85)" : "none", display: "flex" }}>{icon}</div>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: isMobile ? 10 : 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.1 }}>
          {label}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, active, activeColor, activeBg, activeBorder, disabled }: {
  onClick:      () => void;
  icon:         React.ReactNode;
  label:        string;
  active?:      boolean;
  activeColor?: string;
  activeBg?:    string;
  activeBorder?:string;
  disabled?:    boolean;
}) {
  const color  = active && activeColor ? activeColor : "#475569";
  const bg     = active && activeBg    ? activeBg    : "#fff";
  const border = active && activeBorder ? activeBorder : "#E2E8F0";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px",
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.12s",
      }}
    >
      <span style={{ display: "flex", color }}>{icon}</span>
      {label}
    </button>
  );
}

function LegendItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
    </div>
  );
}
