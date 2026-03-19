import { redirect }       from "next/navigation";
import { auth }           from "@/auth";
import { Building2, Plus } from "lucide-react";
import { getCompanies }   from "@/app/actions/companies";
import { CompaniesTable } from "./_components/CompaniesTable";

export default async function EmpresasPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await getCompanies();

  return (
    <div className="flex flex-col gap-5 h-full min-h-0">

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[14px]">
          <div className="w-[44px] h-[44px] rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] flex items-center justify-center shadow-[0_4px_16px_#2EC4B635]">
            <Building2 className="w-[21px] h-[21px] text-white" />
          </div>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold text-foreground leading-[1.15] tracking-[-0.4px]">
              Empresas
            </h1>
            <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
              Gerencie todas as empresas cadastradas na plataforma
            </p>
          </div>
        </div>

        <a
          href="/signup"
          className="btn-nova-empresa inline-flex items-center gap-[7px] px-5 py-[10px] rounded-xl bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] text-white text-[13.5px] font-bold no-underline shadow-[0_4px_16px_#2EC4B635] transition-opacity duration-150 tracking-[0.01em]"
        >
          <Plus className="w-[15px] h-[15px]" />
          Nova empresa
        </a>
      </div>

      {/* ── Conteúdo ───────────────────────────────────────── */}
      <CompaniesTable initialData={companies} />

    </div>
  );
}
