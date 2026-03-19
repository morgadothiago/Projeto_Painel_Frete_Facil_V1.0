import { redirect }           from "next/navigation";
import { auth }               from "@/auth";
import { getVehicleTypes }    from "@/app/actions/vehicleTypes";
import { PageHeader }         from "@/components/dashboard/page-header";
import { VehicleTypesClient } from "./_components/VehicleTypesClient";

export default async function VeiculosPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  const data = await getVehicleTypes();
  const count = data.length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, overflow: "hidden", minHeight: 0 }}>
      <PageHeader
        label="Configurações"
        title="Tipos de Veículo"
        subtitle={`${count} tipo${count !== 1 ? "s" : ""} cadastrado${count !== 1 ? "s" : ""}`}
      />
      <VehicleTypesClient initialData={data} />
    </div>
  );
}
