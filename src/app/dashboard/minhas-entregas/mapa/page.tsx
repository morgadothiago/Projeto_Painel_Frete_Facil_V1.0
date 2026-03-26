import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { MapaTempoRealClient } from "./_components/MapaTempoRealClient";
import { getActiveDeliveries } from "@/app/actions/deliveries";

export default async function MapaTempoRealPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard");

  // Busca entregas em curso no server
  const initialDeliveries = await getActiveDeliveries();

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0C6B64] border-t-transparent" />
        </div>
      }
    >
      <MapaTempoRealClient initialDeliveries={initialDeliveries} />
    </Suspense>
  );
}
