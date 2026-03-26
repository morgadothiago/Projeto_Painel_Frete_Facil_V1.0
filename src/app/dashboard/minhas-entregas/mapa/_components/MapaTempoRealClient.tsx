"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Clock, Gauge, Package, Play, Square, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  getActiveDeliveries,
  startSimulation,
  stopSimulation,
  getSimulationStatus,
  type Delivery,
} from "@/app/actions/deliveries";

// ─── Dynamic map ─────────────────────────────────────────────────────────────

const MapView = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", background: "#eef0f3", gap: 14 }}>
      <TruckSVG size={52} />
      <p style={{ margin: 0, fontSize: 13.5, color: "#94A3B8", fontWeight: 500 }}>Carregando mapa…</p>
    </div>
  ),
});

// ─── SVG Truck ───────────────────────────────────────────────────────────────

function TruckSVG({ size = 40, white = false }: { size?: number; white?: boolean }) {
  const c1 = white ? "rgba(255,255,255,0.9)" : "#0C6B64";
  const c2 = white ? "rgba(255,255,255,0.5)" : "#2EC4B6";
  const c3 = white ? "rgba(255,255,255,0.25)" : "#2EC4B6";
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 80 52" fill="none">
      {/* caçamba */}
      <rect x="2" y="6" width="44" height="34" rx="6" fill={c2} opacity="0.18" />
      <rect x="4" y="8" width="40" height="30" rx="5" fill={c2} opacity="0.28" />
      {/* janelas */}
      <rect x="8" y="12" width="17" height="12" rx="2.5" fill={c1} opacity="0.8" />
      <rect x="9" y="13" width="7.5" height="10" rx="1.5" fill={c2} opacity="0.55" />
      <rect x="17.5" y="13" width="6.5" height="10" rx="1.5" fill={c2} opacity="0.35" />
      {/* cabine / baú */}
      <path d="M46 12 h18 l12 13 v13 H46 V12z" fill={c1} opacity="0.45" />
      <rect x="48" y="15" width="12" height="10" rx="2" fill={c2} opacity="0.5" />
      {/* grade frontal */}
      <rect x="74" y="28" width="4" height="10" rx="2" fill={c1} opacity="0.3" />
      {/* barra lateral */}
      <rect x="6" y="34" width="34" height="2.5" rx="1.25" fill={c1} opacity="0.12" />
      {/* espelhos */}
      <rect x="44" y="14" width="3" height="5" rx="1" fill={c3} opacity="0.6" />
      {/* rodas */}
      <circle cx="19" cy="42" r="8" fill={c1} opacity="0.15" />
      <circle cx="19" cy="42" r="5.5" fill={c1} opacity="0.7" />
      <circle cx="19" cy="42" r="2.5" fill="white" opacity="0.9" />
      <circle cx="60" cy="42" r="8" fill={c1} opacity="0.15" />
      <circle cx="60" cy="42" r="5.5" fill={c1} opacity="0.7" />
      <circle cx="60" cy="42" r="2.5" fill="white" opacity="0.9" />
      {/* linhas de velocidade */}
      <line x1="0" y1="22" x2="2" y2="22" stroke={c2} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="0" y1="17" x2="1.5" y2="17" stroke={c2} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="0" y1="27" x2="1.5" y2="27" stroke={c2} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

// ─── Sidebar delivery card ────────────────────────────────────────────────────

function DeliveryCard({
  delivery,
  index,
  isSelected,
  onSelect,
}: {
  delivery: Delivery;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "left", border: "none",
        background: isSelected
          ? "linear-gradient(135deg, #0C6B64, #1a8a82)"
          : "#fff",
        borderRadius: 16,
        padding: "14px 16px",
        cursor: "pointer",
        boxShadow: isSelected
          ? "0 8px 32px rgba(12,107,100,0.35)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.2s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* número da entrega */}
      <div style={{
        position: "absolute", top: 10, right: 14,
        fontSize: 11, fontWeight: 700,
        color: isSelected ? "rgba(255,255,255,0.4)" : "#CBD5E1",
        fontFamily: "monospace",
      }}>
        #{String(index + 1).padStart(2, "0")}
      </div>

      {/* veículo + tipo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: isSelected ? "rgba(255,255,255,0.15)" : "#F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <TruckSVG size={22} white={isSelected} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: isSelected ? "#fff" : "#0F172A" }}>
            {delivery.vehicleType.name}
          </p>
          {delivery.driver && (
            <p style={{ margin: "1px 0 0", fontSize: 11.5, color: isSelected ? "rgba(255,255,255,0.65)" : "#94A3B8" }}>
              {delivery.driver.name}
            </p>
          )}
        </div>
      </div>

      {/* rota */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, flexShrink: 0, gap: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isSelected ? "#6ee7b7" : "#10b981", flexShrink: 0 }} />
          <div style={{ width: 1, flex: 1, minHeight: 14, background: isSelected ? "rgba(255,255,255,0.2)" : "#E2E8F0" }} />
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isSelected ? "#fca5a5" : "#ef4444", flexShrink: 0 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 12, color: isSelected ? "rgba(255,255,255,0.8)" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {delivery.originAddress}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: isSelected ? "rgba(255,255,255,0.8)" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {delivery.destAddress}
          </p>
        </div>
      </div>

      {/* footer */}
      {(delivery.estimatedDistance || delivery.driver?.rating) && (
        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.15)" : "#F1F5F9"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {delivery.estimatedDistance ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.7)" : "#64748B" }}>
              {delivery.estimatedDistance.toFixed(1)} km
            </span>
          ) : <span />}
          {delivery.driver && (
            <span style={{ fontSize: 12, color: isSelected ? "#fde68a" : "#f59e0b", fontWeight: 600 }}>
              ★ {delivery.driver.rating.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function MapaTempoRealClient({ initialDeliveries }: { initialDeliveries: Delivery[] }) {
  const [deliveries, setDeliveries]   = useState(initialDeliveries);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null);
  const [simState, setSimState]       = useState<"idle" | "loading" | "running">("idle");
  const [simDriver, setSimDriver]     = useState<string | null>(null);

  const selected = deliveries.find(d => d.id === selectedId);

  const fetchActive = useCallback(async () => {
    try {
      const data = await getActiveDeliveries();
      setDeliveries(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("[mapa]", err);
    }
  }, []);

  useEffect(() => {
    setLastUpdate(new Date());
    // Verifica se há simulação em curso ao montar
    getSimulationStatus().then(s => {
      if (s.running.length > 0) setSimState("running");
    });
    const poll = setInterval(fetchActive, 1_500); // sincronizado com intervalo da simulação
    return () => clearInterval(poll);
  }, [fetchActive]);

  const handlePlay = async () => {
    setSimState("loading");
    const result = await startSimulation();
    if (result) {
      setSimState("running");
      setSimDriver(result.driverName);
      fetchActive();
    } else {
      setSimState("idle");
    }
  };

  const handleStop = async () => {
    await stopSimulation();
    setSimState("idle");
    setSimDriver(null);
    fetchActive();
  };

  return (
    <div style={{ position: "relative", height: "100%", background: "#eef0f3", overflow: "hidden" }}>

      {/* ── Mapa (full area) ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <MapView
          deliveries={deliveries}
          selectedDelivery={selectedId}
          onSelectDelivery={setSelectedId}
        />
      </div>

      {/* ── Header flutuante ── */}
      <div style={{
        position: "absolute", top: 16, left: 16, right: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.8)",
        padding: "10px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
        zIndex: 1000,
      }}>
        {/* Esquerda */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/dashboard/minhas-entregas"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 10,
              border: "1.5px solid #E2E8F0", color: "#475569",
              textDecoration: "none", background: "#fff",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} />
          </Link>

          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(12,107,100,0.3)",
            flexShrink: 0,
          }}>
            <TruckSVG size={22} white />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>
              Mapa em Tempo Real
            </h1>
            <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>
              {lastUpdate
                ? `Última atualização ${lastUpdate.toLocaleTimeString("pt-BR")}`
                : "Carregando…"}
            </p>
          </div>
        </div>

        {/* Direita */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Contador entregas */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "6px 12px", borderRadius: 12,
            background: "#F8FAFC", border: "1.5px solid #E2E8F0",
          }}>
            <TruckSVG size={16} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{deliveries.length}</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>em curso</span>
          </div>

          {/* Ao vivo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 12,
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
              display: "inline-block", flexShrink: 0,
              animation: "pulseGreen 2s infinite",
            }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#16a34a" }}>Ao vivo</span>
          </div>

          {/* Botão Play / Stop simulação */}
          {simState === "running" ? (
            <button
              onClick={handleStop}
              title="Parar simulação"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 2px 10px rgba(220,38,38,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              <Square size={13} fill="white" />
              {simDriver ? `Parar — ${simDriver}` : "Parar simulação"}
            </button>
          ) : (
            <button
              onClick={handlePlay}
              disabled={simState === "loading"}
              title="Iniciar simulação de entrega"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 12, border: "none",
                background: simState === "loading"
                  ? "#94A3B8"
                  : "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: simState === "loading" ? "not-allowed" : "pointer",
                boxShadow: simState === "loading" ? "none" : "0 2px 10px rgba(12,107,100,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {simState === "loading"
                ? <><Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> Iniciando…</>
                : <><Play size={13} fill="white" /> Simular entrega</>
              }
            </button>
          )}
        </div>
      </div>

      {/* ── Sidebar flutuante (direita) ── */}
      <div style={{
        position: "absolute", top: 84, right: 16, bottom: selected ? 100 : 16,
        width: 292,
        display: "flex", flexDirection: "column",
        zIndex: 999,
        transition: "bottom 0.25s ease",
      }}>
        {/* Painel */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          height: "100%",
        }}>
          {/* Cabeçalho sidebar */}
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Entregas em Curso
              </p>
              <div style={{
                minWidth: 22, height: 22, borderRadius: 7, padding: "0 6px",
                background: deliveries.length > 0 ? "#0C6B64" : "#F1F5F9",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: deliveries.length > 0 ? "#fff" : "#94A3B8" }}>
                  {deliveries.length}
                </span>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            {deliveries.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 16px", gap: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={26} color="#CBD5E1" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#475569" }}>Nenhuma entrega</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>Atualizado a cada 10s</p>
                </div>
              </div>
            ) : (
              deliveries.map((d, i) => (
                <DeliveryCard
                  key={d.id}
                  delivery={d}
                  index={i}
                  isSelected={selectedId === d.id}
                  onSelect={() => setSelectedId(p => p === d.id ? null : d.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar flutuante (entrega selecionada) ── */}
      <div style={{
        position: "absolute", left: 16, right: 324, bottom: 16,
        background: "linear-gradient(135deg, #0C6B64, #1a8a82)",
        borderRadius: 18,
        padding: "14px 20px",
        boxShadow: "0 8px 32px rgba(12,107,100,0.4)",
        zIndex: 998,
        transform: selected ? "translateY(0)" : "translateY(calc(100% + 20px))",
        opacity: selected ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        overflow: "hidden",
      }}>
        {/* fundo decorativo */}
        <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {selected && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TruckSVG size={28} white />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selected.vehicleType.icon} {selected.vehicleType.name}
                  {selected.driver ? ` — ${selected.driver.name}` : ""}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                  #{selected.publicId.slice(0, 8)}
                  {selected.estimatedDistance ? ` · ${selected.estimatedDistance.toFixed(1)} km` : ""}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* Chip: horário */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
              }}>
                <Clock size={13} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
                  {new Date(selected.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Chip: velocidade */}
              {selected.driver?.location && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.12)",
                }}>
                  <Gauge size={13} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
                    {selected.driver.location.speed?.toFixed(0) ?? "0"} km/h
                  </span>
                </div>
              )}

              {/* Fechar */}
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: 32, height: 32, borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, lineHeight: 1, fontFamily: "inherit",
                }}
              >
                ×
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}
