import { redirect }              from "next/navigation";
import { auth }                  from "@/auth";
import { Settings }              from "lucide-react";
import { getFreightConfig, getVehicleTypePricing } from "@/app/actions/freightConfig";
import { FreightConfigClient }   from "./_components/FreightConfigClient";

export default async function FretesPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  const [config, vehicleTypes] = await Promise.all([
    getFreightConfig(),
    getVehicleTypePricing(),
  ]);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
          <Settings className="h-[20px] w-[20px] text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
            Configuração de Fretes
          </h1>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
            Defina as taxas e preços exibidos aos motoristas
          </p>
        </div>
      </div>

      <FreightConfigClient initialConfig={config} initialVehicleTypes={vehicleTypes} />
    </div>
  );
}
