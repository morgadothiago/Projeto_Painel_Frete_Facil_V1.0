import { redirect }              from "next/navigation";
import { auth }                  from "@/auth";
import { Calculator }            from "lucide-react";
import { getActiveVehicleTypes } from "@/app/actions/simulate";
import { SimularFreteClient }    from "./_components/SimularFreteClient";

export default async function SimularFretePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard");

  const vehicleTypes = await getActiveVehicleTypes();

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
          <Calculator className="h-[20px] w-[20px] text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
            Simulação de Frete
          </h1>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
            Calcule o valor estimado antes de criar uma entrega
          </p>
        </div>
      </div>

      <SimularFreteClient vehicleTypes={vehicleTypes} />
    </div>
  );
}
