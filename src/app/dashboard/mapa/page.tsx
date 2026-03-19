import { redirect } from "next/navigation";
import { auth }     from "@/auth";
import { Map }      from "lucide-react";
import { MapClient } from "./_components/MapClient";

export default async function MapaPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 py-2">

      {/* Header */}
      <div className="flex items-center gap-[14px]">
        <div className="w-[44px] h-[44px] rounded-[14px] shrink-0 bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] flex items-center justify-center shadow-[0_4px_14px_rgba(46,196,182,0.35)]">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold text-foreground tracking-[-0.4px]">
            Mapa em tempo real
          </h1>
          <p className="m-0 text-[13px] text-muted-foreground mt-0.5">
            Motoristas livres e entregas pendentes · atualiza a cada 10s
          </p>
        </div>
      </div>

      <MapClient />
    </div>
  );
}
