import { CheckCircle2 } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

export async function SuccessBanner({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string }>;
}) {
  const params = await searchParams;
  if (params.cadastro === "sucesso") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: t.radiusMd,
        background: "#F0FDF4", border: `1px solid ${t.success}30`,
        marginBottom: 20,
      }}>
        <CheckCircle2 style={{ width: 16, height: 16, color: t.success, flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.success }}>
            Conta criada com sucesso!
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#4B7A52" }}>
            Faça login para acessar a plataforma.
          </p>
        </div>
      </div>
    );
  }

  if (params.cadastro === "senha-redefinida") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: t.radiusMd,
        background: "#F0FDF4", border: `1px solid ${t.success}30`,
        marginBottom: 20,
      }}>
        <CheckCircle2 style={{ width: 16, height: 16, color: t.success, flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.success }}>
            Senha redefinida com sucesso!
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#4B7A52" }}>
            Faça login com sua nova senha.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
