import { redirect }          from "next/navigation";
import { auth }              from "@/auth";
import { Car }               from "lucide-react";
import { getVehicleTypes }   from "@/app/actions/vehicleTypes";
import { VehicleTypesClient } from "./_components/VehicleTypesClient";

export default async function VeiculosPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const types = await getVehicleTypes();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "8px 0" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(46,196,182,0.35)",
          }}>
            <Car style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.4px" }}>
              Tipos de Veículo
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {types.length} tipo{types.length !== 1 ? "s" : ""} cadastrado{types.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <VehicleTypesClient initialData={types} />
    </div>
  );
}
