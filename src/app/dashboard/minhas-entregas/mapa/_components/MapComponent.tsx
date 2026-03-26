"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── OSRM route fetch ────────────────────────────────────────────────────────

async function fetchRoadRoute(
  oLat: number, oLng: number, dLat: number, dLng: number,
): Promise<[number, number][]> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const json = await res.json() as any;
    if (json.code !== "Ok") return [];
    return (json.routes[0].geometry.coordinates as [number, number][])
      .map(([lng, lat]) => [lat, lng]);
  } catch {
    return [];
  }
}

// ─── Geometria de rota ───────────────────────────────────────────────────────

/** Snap: encontra o ponto mais próximo na rota e interpola entre segmentos */
function snapToRoute(
  lat: number, lng: number, route: [number, number][],
): { snapped: [number, number]; idx: number; heading: number } {
  if (route.length === 0) return { snapped: [lat, lng], idx: 0, heading: 0 };
  if (route.length === 1) return { snapped: route[0], idx: 0, heading: 0 };

  let bestIdx = 0;
  let bestT = 0;
  let minDist = Infinity;

  for (let i = 0; i < route.length - 1; i++) {
    const [aLat, aLng] = route[i];
    const [bLat, bLng] = route[i + 1];

    // Projeção do ponto no segmento AB
    const abLat = bLat - aLat;
    const abLng = bLng - aLng;
    const abLen2 = abLat * abLat + abLng * abLng;

    let t = 0;
    if (abLen2 > 0) {
      t = ((lat - aLat) * abLat + (lng - aLng) * abLng) / abLen2;
      t = Math.max(0, Math.min(1, t));
    }

    const projLat = aLat + t * abLat;
    const projLng = aLng + t * abLng;
    const dist = Math.hypot(lat - projLat, lng - projLng);

    if (dist < minDist) {
      minDist = dist;
      bestIdx = i;
      bestT = t;
    }
  }

  const [aLat, aLng] = route[bestIdx];
  const [bLat, bLng] = route[bestIdx + 1];
  const snappedLat = aLat + bestT * (bLat - aLat);
  const snappedLng = aLng + bestT * (bLng - aLng);

  // Heading: direção do ponto atual para o próximo ponto na rota
  const nextIdx = Math.min(bestIdx + 1, route.length - 1);
  const nextNextIdx = Math.min(bestIdx + 2, route.length - 1);
  const targetLat = route[nextNextIdx][0];
  const targetLng = route[nextNextIdx][1];
  const heading = bearing(snappedLat, snappedLng, targetLat, targetLng);

  return { snapped: [snappedLat, snappedLng], idx: bestIdx, heading };
}

/** Bearing em graus entre dois pontos (0=norte, clockwise) */
function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(rLat2);
  const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DriverLocation = {
  id: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  timestamp: string;
};

type Delivery = {
  id: string;
  publicId: string;
  originAddress: string;
  originLat: number;
  originLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  vehicleType: { name: string; icon: string };
  driver: {
    id: string;
    name: string;
    rating: number;
    location: DriverLocation | null;
  };
  estimatedDistance: number | null;
  createdAt: string;
};

type Props = {
  deliveries: Delivery[];
  selectedDelivery: string | null;
  onSelectDelivery: (id: string | null) => void;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
// NÃO usar transition no leaflet-marker-icon — conflita com setLatLng()

const MAP_CSS = `
  .driver-marker-pulse::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid currentColor;
    animation: driverPulse 2s ease-out infinite;
    opacity: 0;
  }
  @keyframes driverPulse {
    0%   { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(2);   opacity: 0; }
  }
`;

// ─── Ícones ──────────────────────────────────────────────────────────────────

const originIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function makeDriverIcon(selected: boolean, heading: number | null) {
  const rotate = heading != null ? `rotate(${heading}deg)` : "";
  const size   = selected ? 46 : 38;
  const bg     = selected ? "#0C6B64" : "#2563eb";
  const border = selected ? "#2EC4B6" : "white";
  const shadow = selected
    ? "0 4px 20px rgba(12,107,100,0.55)"
    : "0 2px 10px rgba(0,0,0,0.3)";

  return new L.DivIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: ${size}px; height: ${size}px;
        background: ${bg};
        border: 3px solid ${border};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: ${shadow};
        transform: ${rotate};
      ">
        <svg width="${size * 0.55}" height="${size * 0.35}" viewBox="0 0 80 52" fill="none">
          <rect x="2" y="6" width="44" height="34" rx="6" fill="white" opacity="0.15"/>
          <rect x="4" y="8" width="40" height="30" rx="5" fill="white" opacity="0.25"/>
          <rect x="8" y="12" width="17" height="12" rx="2.5" fill="white" opacity="0.7"/>
          <path d="M46 12 h18 l12 13 v13 H46 V12z" fill="white" opacity="0.4"/>
          <rect x="48" y="15" width="12" height="10" rx="2" fill="white" opacity="0.45"/>
          <circle cx="19" cy="42" r="5.5" fill="white" opacity="0.8"/>
          <circle cx="19" cy="42" r="2.5" fill="${bg}"/>
          <circle cx="60" cy="42" r="5.5" fill="white" opacity="0.8"/>
          <circle cx="60" cy="42" r="2.5" fill="${bg}"/>
        </svg>
        ${selected ? `
        <div style="
          position: absolute; inset: -8px; border-radius: 50%;
          border: 2px solid ${border}; opacity: 0;
          animation: driverPulse 2s ease-out infinite;
        "/>` : ""}
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── AnimatedDriverMarker — animação suave via requestAnimationFrame ─────────

function AnimatedDriverMarker({
  snappedPos,
  heading,
  isSelected,
  delivery,
  onClick,
}: {
  snappedPos: [number, number];
  heading: number;
  isSelected: boolean;
  delivery: Delivery;
  onClick: () => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const animRef   = useRef<number | null>(null);
  const currentRef = useRef<[number, number]>(snappedPos);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const [targetLat, targetLng] = snappedPos;
    const [fromLat, fromLng] = currentRef.current;
    const duration = 800; // ms
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const lat = fromLat + (targetLat - fromLat) * ease;
      const lng = fromLng + (targetLng - fromLng) * ease;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        currentRef.current = [targetLat, targetLng];
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    marker.setIcon(makeDriverIcon(isSelected, heading));

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [snappedPos[0], snappedPos[1], heading, isSelected]);

  const speed = delivery.driver.location?.speed;

  return (
    <Marker
      position={snappedPos}
      icon={makeDriverIcon(isSelected, heading)}
      ref={(ref) => { markerRef.current = ref; }}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div style={{ fontSize: 13, minWidth: 140 }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700 }}>
            {delivery.vehicleType.icon} {delivery.vehicleType.name}
          </p>
          <p style={{ margin: "0 0 2px", color: "#475569" }}>{delivery.driver.name}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>
            {speed != null ? `${Math.round(speed)} km/h` : "—"}
            {delivery.estimatedDistance ? ` · ${delivery.estimatedDistance.toFixed(1)} km` : ""}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// ─── FitBounds ───────────────────────────────────────────────────────────────

function FitBounds({ deliveries, selectedDelivery }: { deliveries: Delivery[]; selectedDelivery: string | null }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (deliveries.length === 0) return;

    if (selectedDelivery) {
      const d = deliveries.find(x => x.id === selectedDelivery);
      if (d?.driver.location) {
        map.flyTo([d.driver.location.lat, d.driver.location.lng], 15, { duration: 1.2 });
        return;
      }
    }

    if (!hasFitted.current) {
      const points: [number, number][] = deliveries.flatMap(d => [
        [d.originLat, d.originLng],
        [d.destLat,   d.destLng],
        ...(d.driver.location ? [[d.driver.location.lat, d.driver.location.lng] as [number, number]] : []),
      ]);
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [60, 60] });
        hasFitted.current = true;
      }
    }
  }, [deliveries, selectedDelivery, map]);

  return null;
}

// ─── DeliveryLayer — busca rota real e renderiza tudo de uma entrega ─────────

function DeliveryLayer({
  delivery,
  isSelected,
  onSelect,
}: {
  delivery: Delivery;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    fetchRoadRoute(delivery.originLat, delivery.originLng, delivery.destLat, delivery.destLng)
      .then(pts => { if (pts.length > 0) setRoadRoute(pts); });
  }, [delivery.id, delivery.originLat, delivery.originLng, delivery.destLat, delivery.destLng]);

  const driverPos = delivery.driver?.location;

  // Snap do motorista na rota
  let snappedPos: [number, number] | null = null;
  let snappedHeading = 0;
  let traveledRoute: [number, number][] = [];
  let remainingRoute: [number, number][] = roadRoute;

  if (driverPos && roadRoute.length > 1) {
    const snap = snapToRoute(driverPos.lat, driverPos.lng, roadRoute);
    snappedPos = snap.snapped;
    snappedHeading = snap.heading;

    // traveled = do início até o snap point
    traveledRoute = [...roadRoute.slice(0, snap.idx + 1), snap.snapped];
    // remaining = do snap point até o fim
    remainingRoute = [snap.snapped, ...roadRoute.slice(snap.idx + 1)];
  }

  const straight: [number, number][] = [
    [delivery.originLat, delivery.originLng],
    [delivery.destLat,   delivery.destLng],
  ];

  return (
    <>
      {/* Rota completa (tracejada) — linha de fundo */}
      <Polyline
        positions={roadRoute.length > 1 ? roadRoute : straight}
        color={isSelected ? "#0C6B64" : "#94a3b8"}
        weight={isSelected ? 4 : 2.5}
        opacity={isSelected ? 0.25 : 0.2}
        dashArray="6,8"
      />

      {/* Trecho percorrido (verde escuro) */}
      {traveledRoute.length > 1 && (
        <Polyline
          positions={traveledRoute}
          color="#0C6B64"
          weight={isSelected ? 5 : 3.5}
          opacity={isSelected ? 0.7 : 0.5}
        />
      )}

      {/* Trecho restante (teal vivo) */}
      {remainingRoute.length > 1 && snappedPos && (
        <Polyline
          positions={remainingRoute}
          color="#2EC4B6"
          weight={isSelected ? 4.5 : 3}
          opacity={isSelected ? 0.9 : 0.6}
        />
      )}

      {/* Origem */}
      <Marker position={[delivery.originLat, delivery.originLng]} icon={originIcon}>
        <Popup>
          <div style={{ fontSize: 13 }}>
            <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#059669" }}>Origem</p>
            <p style={{ margin: 0 }}>{delivery.originAddress}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>
              #{delivery.publicId.slice(0, 8)}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Destino */}
      <Marker position={[delivery.destLat, delivery.destLng]} icon={destIcon}>
        <Popup>
          <div style={{ fontSize: 13 }}>
            <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#dc2626" }}>Destino</p>
            <p style={{ margin: 0 }}>{delivery.destAddress}</p>
          </div>
        </Popup>
      </Marker>

      {/* Motorista animado — snapped na rota */}
      {snappedPos && (
        <AnimatedDriverMarker
          snappedPos={snappedPos}
          heading={snappedHeading}
          isSelected={isSelected}
          delivery={delivery}
          onClick={onSelect}
        />
      )}
    </>
  );
}

// ─── MapComponent ────────────────────────────────────────────────────────────

export default function MapComponent({ deliveries, selectedDelivery, onSelectDelivery }: Props) {
  const center: [number, number] = [-23.5505, -46.6333];

  return (
    <>
      <style>{MAP_CSS}</style>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <ZoomControl />
        <FitBounds deliveries={deliveries} selectedDelivery={selectedDelivery} />

        {deliveries.map(delivery => (
          <DeliveryLayer
            key={delivery.id}
            delivery={delivery}
            isSelected={selectedDelivery === delivery.id}
            onSelect={() => onSelectDelivery(delivery.id)}
          />
        ))}
      </MapContainer>
    </>
  );
}

// ─── Zoom control SVG ────────────────────────────────────────────────────────

function ZoomControl() {
  const map = useMap();
  return (
    <div style={{
      position: "absolute", bottom: 80, left: 16, zIndex: 1000,
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      {[{ label: "+", fn: () => map.zoomIn() }, { label: "−", fn: () => map.zoomOut() }].map(btn => (
        <button
          key={btn.label}
          onClick={btn.fn}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            fontSize: 20, lineHeight: 1,
            color: "#475569", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
