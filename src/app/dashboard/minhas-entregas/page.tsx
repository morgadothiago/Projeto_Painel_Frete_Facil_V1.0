import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { MinhasEntregasClient } from "./_components/MinhasEntregasClient";
import { getCompanyDeliveries, getDeliveryStats } from "@/app/actions/deliveries";

export default async function MinhasEntregasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard");

  // Busca lista paginada e stats globais em paralelo
  const [initialData, initialStats] = await Promise.all([
    getCompanyDeliveries({ status: "ALL", period: "30", page: 1, limit: 10 }),
    getDeliveryStats(),
  ]);

  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #2EC4B6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <MinhasEntregasClient initialData={initialData} initialStats={initialStats} />
    </Suspense>
  );
}
