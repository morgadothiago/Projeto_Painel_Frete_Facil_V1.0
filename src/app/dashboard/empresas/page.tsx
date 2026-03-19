import { redirect }       from "next/navigation";
import { auth }           from "@/auth";
import { Building2, Plus } from "lucide-react";
import { getCompanies }   from "@/app/actions/companies";
import { CompaniesTable } from "./_components/CompaniesTable";
import { tenantConfig }   from "@/config/tenant";

const { theme: t } = tenantConfig;

export default async function EmpresasPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await getCompanies();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 20,
      height: "100%", minHeight: 0,
    }}>

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, #0C6B64, ${t.primary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${t.primary}35`,
          }}>
            <Building2 style={{ width: 21, height: 21, color: "#fff" }} />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800,
              color: t.textPrimary, lineHeight: 1.15,
              letterSpacing: "-0.4px",
            }}>
              Empresas
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: t.textSecondary, marginTop: 2 }}>
              Gerencie todas as empresas cadastradas na plataforma
            </p>
          </div>
        </div>

        <a
          href="/signup"
          className="btn-nova-empresa"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 12,
            background: `linear-gradient(135deg, #0C6B64, ${t.primary})`,
            color: "#fff", fontSize: 13.5, fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 4px 16px ${t.primary}35`,
            transition: "opacity 0.15s",
            letterSpacing: "0.01em",
          }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Nova empresa
        </a>
      </div>

      {/* ── Conteúdo ───────────────────────────────────────── */}
      <CompaniesTable initialData={companies} />

    </div>
  );
}
