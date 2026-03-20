import { redirect }           from "next/navigation";
import { auth }               from "@/auth";
import { Building2 }          from "lucide-react";
import { getCompanies }       from "@/app/actions/companies";
import { CompaniesTable }     from "./_components/CompaniesTable";
import { NewCompanyButton }   from "./_components/NewCompanyButton";

export default async function EmpresasPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await getCompanies();

  return (
    <div className="flex flex-col gap-5">

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
        <NewCompanyButton />
      </div>

      <CompaniesTable initialData={companies} />
    </div>
  );
}
