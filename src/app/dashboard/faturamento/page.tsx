import { redirect }     from "next/navigation";
import { auth }         from "@/auth";
import { Wallet }       from "lucide-react";
import { getCompanies } from "@/app/actions/companies";
import { FaturamentoClient } from "./_components/FaturamentoClient";

export default async function FaturamentoPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await getCompanies();

  return (
    <div className="flex min-h-0 flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_6px_20px_rgba(46,196,182,0.40)]">
            <Wallet className="h-[22px] w-[22px] text-white" />
          </div>
          <div>
            <h1 className="m-0 text-[24px] font-black leading-tight tracking-[-0.5px] text-slate-900">
              Faturamento
            </h1>
            <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
              Gerencie mensalidades e situação financeira das empresas
            </p>
          </div>
        </div>
      </div>

      <FaturamentoClient initialData={companies} />
    </div>
  );
}
