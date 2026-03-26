import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { getFretesHistorico } from "@/app/actions/deliveries";
import { FretesHistoricoClient } from "./_components/FretesHistoricoClient";

export default async function FretesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard");

  const initialData = await getFretesHistorico({ page: 1, limit: 10 });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
          <ClipboardList className="h-[20px] w-[20px] text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
            Fretes
          </h1>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
            Fretes finalizados e cancelados
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "2.5px solid #2EC4B6", borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        }
      >
        <FretesHistoricoClient initialData={initialData} />
      </Suspense>
    </div>
  );
}
