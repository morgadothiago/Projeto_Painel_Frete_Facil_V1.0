import { redirect }              from "next/navigation";
import { auth }                  from "@/auth";
import { Settings }              from "lucide-react";
import { getFreightConfig, getVehicleTypePricing } from "@/app/actions/freightConfig";
import { FreightConfigClient }   from "./_components/FreightConfigClient";

export default async function FretesPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [config, vehicleTypes] = await Promise.all([
    getFreightConfig(),
    getVehicleTypePricing(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, padding: "8px 0" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(46,196,182,0.35)",
        }}>
          <Settings style={{ width: 20, height: 20, color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.4px" }}>
            Configuração de Fretes
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>
            Defina as taxas e preços exibidos aos motoristas
          </p>
        </div>
      </div>

      <FreightConfigClient initialConfig={config} initialVehicleTypes={vehicleTypes} />
    </div>
  );
}
