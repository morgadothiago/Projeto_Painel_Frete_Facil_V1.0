import { redirect }           from "next/navigation";
import { auth }               from "@/auth";
import { Car, Plus }          from "lucide-react";
import { getVehicleTypes }    from "@/app/actions/vehicleTypes";
import { VehicleTypesClient } from "./_components/VehicleTypesClient";

export default async function VeiculosPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  const data = await getVehicleTypes();

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
          <Car className="h-[20px] w-[20px] text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
            Tipos de Veículo
          </h1>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
            {data.length} tipo{data.length !== 1 ? "s" : ""} cadastrado{data.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <VehicleTypesClient initialData={data} />
    </div>
  );
}
