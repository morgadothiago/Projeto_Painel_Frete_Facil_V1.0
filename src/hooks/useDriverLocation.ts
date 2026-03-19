"use client";

import { useEffect, useRef } from "react";
import { pushGpsLocation, setDriverOnline } from "@/app/actions/gps";

/**
 * Hook para motoristas — captura a geolocalização do dispositivo e envia
 * ao servidor a cada `intervalMs` ms (padrão 8s) via Geolocation API.
 *
 * Uso: chame em qualquer página do painel do motorista (ex: layout do dashboard).
 * Só funciona se o usuário permitir a permissão de localização no browser.
 */
export function useDriverLocation(
  enabled: boolean,
  deliveryId?: string,
  intervalMs = 8_000,
) {
  const watchId  = useRef<number | null>(null);
  const timerId  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPos  = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) return;

    setDriverOnline(true);

    // Observa a posição continuamente
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => { lastPos.current = pos; },
      (err) => console.warn("[useDriverLocation] geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 5_000 },
    );

    // Envia ao servidor no intervalo definido
    timerId.current = setInterval(async () => {
      if (!lastPos.current) return;
      const { latitude, longitude, heading, speed } = lastPos.current.coords;
      await pushGpsLocation(
        latitude,
        longitude,
        heading ?? undefined,
        speed ?? undefined,
        deliveryId,
      );
    }, intervalMs);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (timerId.current  !== null) clearInterval(timerId.current);
      setDriverOnline(false);
    };
  }, [enabled, deliveryId, intervalMs]);
}
