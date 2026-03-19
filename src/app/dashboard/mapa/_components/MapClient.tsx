"use client";

import dynamic from "next/dynamic";

// Leaflet não suporta SSR — importa apenas no cliente
const MapView = dynamic(
  () => import("./MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: 520, borderRadius: 16,
        background: "#F8FAFC", border: "1px solid #E2E8F0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "#94A3B8",
      }}>
        Carregando mapa…
      </div>
    ),
  },
);

export function MapClient() {
  return <MapView />;
}
