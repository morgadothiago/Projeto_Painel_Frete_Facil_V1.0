"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMapData, type MapData } from "@/app/actions/map";
import { simulateDriverNear }       from "@/app/actions/dev";
import { toast }                    from "sonner";
import { cn }                       from "@/lib/utils";
import { Truck, Package, RefreshCw, Users, MapPin, FlaskConical } from "lucide-react";

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
  const [data,       setData]      = useState<MapData>({ drivers: [], deliveries: [] });
  const [loading,    setLoading]   = useState(true);
  const [lastSync,   setLastSync]  = useState<Date | null>(null);
  const [myLocation,   setMyLocation]   = useState<MyLocation>(null);
  const [locating,     setLocating]     = useState(false);
  const [simulating,   setSimulating]   = useState(false);
  const knownDriverIds = useRef<Set<string>>(new Set());

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
    <div className="flex flex-col gap-4">

      {/* ── Stats bar ── */}
      <div className="flex gap-3 flex-wrap">
        <StatCard
          icon={<Users className="w-4 h-4 text-[#0C6B64]" />}
          label="Motoristas livres"
          value={data.drivers.length}
          color="#0C6B64"
          bg="#E6FAF8"
        />
        <StatCard
          icon={<Package className="w-4 h-4 text-[#D97706]" />}
          label="Entregas pendentes"
          value={data.deliveries.length}
          color="#D97706"
          bg="#FEF3C7"
        />
        <div className="ml-auto flex items-center gap-2">
          <button
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
            className={cn(
              "flex items-center gap-1.5 px-[14px] py-2 rounded-[10px]",
              "border border-[#BFDBFE] text-[12.5px] font-semibold cursor-pointer",
              myLocation ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-white text-[#475569]",
            )}
          >
            <MapPin className="w-[13px] h-[13px]" />
            {locating ? "Buscando…" : myLocation ? "Minha localização" : "Me localizar"}
          </button>
          {/* Simular motorista próximo — só aparece se tiver localização */}
          {myLocation && (
            <button
              onClick={async () => {
                setSimulating(true);
                const res = await simulateDriverNear(myLocation.lat, myLocation.lng);
                if (res.ok) {
                  toast.success(`Motorista simulado perto de você!`, {
                    description: `${res.name} aparecerá no mapa em instantes.`,
                  });
                  await refresh();
                } else {
                  toast.error("Nenhum motorista encontrado no banco para simular.");
                }
                setSimulating(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-[14px] py-2 rounded-[10px]",
                "border border-[#D8B4FE] bg-[#FAF5FF] text-[12.5px] font-semibold text-violet-600",
                simulating ? "cursor-not-allowed opacity-70" : "cursor-pointer opacity-100",
              )}
            >
              <FlaskConical className="w-[13px] h-[13px]" />
              {simulating ? "Simulando…" : "Simular motorista aqui"}
            </button>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-[14px] py-2 rounded-[10px] border border-border bg-white text-[12.5px] font-semibold text-[#475569] cursor-pointer"
          >
            <RefreshCw className="w-[13px] h-[13px]" />
            Atualizar
          </button>
          {lastSync && (
            <span suppressHydrationWarning className="text-[11.5px] text-[#94A3B8]">
              Atualizado às {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* ── Legenda ── */}
      <div className="flex gap-4 text-[12.5px] text-[#64748B]">
        <span className="flex items-center gap-1.5">
          <span className="text-base">🚗</span> Motorista livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-base">📦</span> Entrega pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#4285F4] border-2 border-white shadow-[0_0_0_3px_rgba(66,133,244,0.3)]" />
          Minha localização
        </span>
      </div>

      {/* ── Mapa ── */}
      <div className="rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-border h-[520px] relative">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 bg-[#F8FAFC]">
            <MapPin className="w-8 h-8 text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#94A3B8]">Carregando mapa…</p>
          </div>
        ) : (
          <MapContainer
            center={[-23.55, -46.63]}
            zoom={11}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds data={data} locked={!!myLocation} />
            <FlyToLocation location={myLocation} />

            {/* Minha localização */}
            {myLocation && (
              <Marker
                position={[myLocation.lat, myLocation.lng]}
                icon={myLocationIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13 }}>
                      📍 Você está aqui
                    </p>
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
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>
                      🚛 {driver.name}
                    </p>
                    {driver.vehicle && (
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                        Veículo: {driver.vehicle}
                      </p>
                    )}
                    {driver.plate && (
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                        Placa: <b>{driver.plate}</b>
                      </p>
                    )}
                    {driver.phone && (
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                        Tel: {driver.phone}
                      </p>
                    )}
                    <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#2EC4B6", fontWeight: 600 }}>
                      ⭐ {driver.rating.toFixed(1)} · Livre
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {data.deliveries.map((delivery) => (
              <Marker
                key={delivery.id}
                position={[delivery.originLat, delivery.originLng]}
                icon={deliveryIcon}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>
                      📦 #{delivery.publicId}
                    </p>
                    <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                      Empresa: {delivery.company}
                    </p>
                    {delivery.description && (
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#555" }}>
                        Carga: {delivery.description}
                      </p>
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

      {/* ── Empty state ── */}
      {!loading && data.drivers.length === 0 && data.deliveries.length === 0 && (
        <div className="p-5 rounded-xl bg-[#FFF8E7] border border-[#FDE68A] text-[13px] text-[#92400E] text-center">
          Nenhum motorista online ou entrega pendente com coordenadas no momento.
        </div>
      )}

    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-[10px] rounded-xl border"
      style={{ background: bg, borderColor: `${color}25` }}
    >
      {icon}
      <div>
        <p className="m-0 text-[11.5px] font-semibold" style={{ color }}>{label}</p>
        <p className="m-0 text-[20px] font-extrabold leading-[1.2]" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}
