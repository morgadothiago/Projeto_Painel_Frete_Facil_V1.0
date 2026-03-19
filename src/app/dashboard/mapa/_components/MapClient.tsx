"use client";

import dynamic from "next/dynamic";

// Leaflet não suporta SSR — importa apenas no cliente
const MapView = dynamic(
  () => import("./MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] rounded-2xl bg-[#F8FAFC] border border-border flex items-center justify-center text-sm text-muted-foreground">
        Carregando mapa…
      </div>
    ),
  },
);

export function MapClient() {
  return <MapView />;
}
