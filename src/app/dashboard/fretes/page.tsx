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
    <div className="flex flex-col gap-7 py-2">

      {/* Header */}
      <div className="flex items-center gap-[14px]">
        <div className="w-[44px] h-[44px] rounded-[14px] shrink-0 bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] flex items-center justify-center shadow-[0_4px_14px_rgba(46,196,182,0.35)]">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold text-foreground tracking-[-0.4px]">
            Configuração de Fretes
          </h1>
          <p className="m-0 text-[13px] text-muted-foreground mt-0.5">
            Defina as taxas e preços exibidos aos motoristas
          </p>
        </div>
      </div>

      <FreightConfigClient initialConfig={config} initialVehicleTypes={vehicleTypes} />
    </div>
  );
}
