"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMapData, type MapData } from "@/app/actions/map";
import { Truck, Package, RefreshCw, Users, MapPin } from "lucide-react";

// ── Ícones personalizados ──────────────────────────────────────────────────────

const driverIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:38px;height:38px;border-radius:50%;
      background:linear-gradient(135deg,#0C6B64,#2EC4B6);
      border:3px solid #fff;
      box-shadow:0 3px 10px rgba(12,107,100,0.45);
      display:flex;align-items:center;justify-content:center;
      font-size:17px;
    ">🚛</div>`,
  iconSize:   [38, 38],
  iconAnchor: [19, 19],
  popupAnchor:[0, -22],
});

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

// ── Auto-fit bounds ────────────────────────────────────────────────────────────

function FitBounds({ data }: { data: MapData }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      ...data.drivers.map((d)   => [d.lat, d.lng]   as [number, number]),
      ...data.deliveries.map((d) => [d.originLat, d.originLng] as [number, number]),
    ];
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
}

// ── Componente principal ───────────────────────────────────────────────────────

type MyLocation = { lat: number; lng: number } | null;

export function MapView() {
  const [data,       setData]      = useState<MapData>({ drivers: [], deliveries: [] });
  const [loading,    setLoading]   = useState(true);
  const [lastSync,   setLastSync]  = useState<Date | null>(null);
  const [myLocation, setMyLocation] = useState<MyLocation>(null);
  const [locating,   setLocating]  = useState(false);
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Stats bar ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard
          icon={<Users style={{ width: 16, height: 16, color: "#0C6B64" }} />}
          label="Motoristas livres"
          value={data.drivers.length}
          color="#0C6B64"
          bg="#E6FAF8"
        />
        <StatCard
          icon={<Package style={{ width: 16, height: 16, color: "#D97706" }} />}
          label="Entregas pendentes"
          value={data.deliveries.length}
          color="#D97706"
          bg="#FEF3C7"
        />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
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
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              border: "1px solid #BFDBFE",
              background: myLocation ? "#EFF6FF" : "#fff",
              fontSize: 12.5, fontWeight: 600,
              color: myLocation ? "#1D4ED8" : "#475569",
              cursor: "pointer",
            }}
          >
            <MapPin style={{ width: 13, height: 13 }} />
            {locating ? "Buscando…" : myLocation ? "Minha localização" : "Me localizar"}
          </button>
          <button
            onClick={refresh}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              border: "1px solid #E2E8F0", background: "#fff",
              fontSize: 12.5, fontWeight: 600, color: "#475569",
              cursor: "pointer",
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Atualizar
          </button>
          {lastSync && (
            <span suppressHydrationWarning style={{ fontSize: 11.5, color: "#94A3B8" }}>
              Atualizado às {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* ── Legenda ── */}
      <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "#64748B" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>🚛</span> Motorista livre
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>📦</span> Entrega pendente
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            display: "inline-block", width: 12, height: 12, borderRadius: "50%",
            background: "#4285F4", border: "2px solid #fff",
            boxShadow: "0 0 0 3px rgba(66,133,244,0.3)",
          }} />
          Minha localização
        </span>
      </div>

      {/* ── Mapa ── */}
      <div style={{
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        border: "1px solid #E2E8F0",
        height: 520,
        position: "relative",
      }}>
        {loading ? (
          <div style={{
            height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            background: "#F8FAFC",
          }}>
            <MapPin style={{ width: 32, height: 32, color: "#CBD5E1" }} />
            <p style={{ margin: 0, fontSize: 14, color: "#94A3B8" }}>Carregando mapa…</p>
          </div>
        ) : (
          <>
          <style>{`
          @keyframes pulse-blue {
            0%   { transform: scale(1);   opacity: 0.6; }
            70%  { transform: scale(2.5); opacity: 0;   }
            100% { transform: scale(1);   opacity: 0;   }
          }
        `}</style>
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

            <FitBounds data={data} />

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
              <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={driverIcon}>
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
          </>
        )}
      </div>

      {/* ── Empty state ── */}
      {!loading && data.drivers.length === 0 && data.deliveries.length === 0 && (
        <div style={{
          padding: "20px", borderRadius: 12,
          background: "#FFF8E7", border: "1px solid #FDE68A",
          fontSize: 13, color: "#92400E", textAlign: "center",
        }}>
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
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderRadius: 12,
      background: bg, border: `1px solid ${color}25`,
    }}>
      {icon}
      <div>
        <p style={{ margin: 0, fontSize: 11.5, color, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );
}
