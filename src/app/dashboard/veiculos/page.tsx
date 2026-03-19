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
    <div className="flex flex-col gap-6 py-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <div className="w-[44px] h-[44px] rounded-[14px] shrink-0 bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] flex items-center justify-center shadow-[0_4px_14px_rgba(46,196,182,0.35)]">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold text-foreground tracking-[-0.4px]">
              Tipos de Veículo
            </h1>
            <p className="m-0 text-[13px] text-muted-foreground mt-0.5">
              {types.length} tipo{types.length !== 1 ? "s" : ""} cadastrado{types.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <VehicleTypesClient initialData={types} />
    </div>
  );
}
