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
          className="inline-flex items-center gap-[10px] no-underline transition-all active:scale-[0.97]"
          style={{
            background: "#0C6B64",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 16px 9px 12px",
            borderRadius: 10,
            boxShadow: "0 1px 3px rgba(12,107,100,0.25), 0 1px 2px rgba(0,0,0,0.08)",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a5e58"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0C6B64"; }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: 6,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Plus className="h-[12px] w-[12px]" strokeWidth={2.5} />
          </span>
          Nova empresa
        </a>
      </div>

      <CompaniesTable initialData={companies} />
    </div>
  );
}
