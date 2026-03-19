import { redirect }  from "next/navigation";
import { auth }      from "@/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { MapClient } from "./_components/MapClient";

export default async function MapaPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, overflow: "hidden", minHeight: 0 }}>
      <PageHeader
        label="Monitoramento"
        title="Mapa em tempo real"
        subtitle="Motoristas livres e entregas pendentes · atualiza a cada 10s"
      />
      <MapClient />
    </div>
  );
}
