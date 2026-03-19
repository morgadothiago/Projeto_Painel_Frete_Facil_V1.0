import { redirect }        from "next/navigation";
import { auth }            from "@/auth";
import { Building2, Plus } from "lucide-react";
import { getCompanies }    from "@/app/actions/companies";
import { CompaniesTable }  from "./_components/CompaniesTable";

export default async function EmpresasPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await getCompanies();

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">

      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
            <Building2 className="h-[20px] w-[20px] text-white" />
          </div>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
              Empresas
            </h1>
            <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
              Gerencie todas as empresas cadastradas na plataforma
            </p>
          </div>
        </div>
        <a
          href="/signup"
          className="inline-flex items-center gap-[10px] rounded-[10px] bg-[#0C6B64] py-[9px] pl-3 pr-4 text-[13px] font-semibold tracking-[0.01em] text-white no-underline shadow-[0_1px_3px_rgba(12,107,100,0.25),0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:bg-[#0a5e58] active:scale-[0.97]"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-white/20">
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </span>
          Nova empresa
        </a>
      </div>

      <CompaniesTable initialData={companies} />
    </div>
  );
}
