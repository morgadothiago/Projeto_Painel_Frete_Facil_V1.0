import { redirect }       from "next/navigation";
import { auth }           from "@/auth";
import { Package }        from "lucide-react";
import { getDeliveries }  from "@/app/actions/freight";
import { getVehicleTypes } from "@/app/actions/vehicleTypes";
import { getCompanies }   from "@/app/actions/companies";
import { FreightClient }  from "./_components/FreightClient";

export default async function FretesPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [deliveries, vehicleTypes, companies] = await Promise.all([
    getDeliveries(),
    getVehicleTypes(),
    getCompanies(),
  ]);

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
            <Package style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.4px" }}>
              Fretes
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {deliveries.length} frete{deliveries.length !== 1 ? "s" : ""} cadastrado{deliveries.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <FreightClient
        initialData={deliveries}
        vehicleTypes={vehicleTypes}
        companies={companies}
      />
    </div>
  );
}
