import { CheckCircle2, AlertTriangle } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  overdue: {
    title: "Conta bloqueada por atraso",
    body: "Sua conta foi bloqueada devido ao atraso no pagamento. Entre em contato com o suporte.",
  },
  inactive: {
    title: "Conta bloqueada",
    body: "Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.",
  },
  pending: {
    title: "Conta pendente de aprovação",
    body: "Sua conta ainda está pendente de aprovação pelo administrador.",
  },
  "pagamento-atrasado": {
    title: "Conta bloqueada por atraso",
    body: "Sua conta foi bloqueada devido ao atraso no pagamento. Entre em contato com o suporte.",
  },
};

export async function SuccessBanner({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (params.error) {
    const msg = ERROR_MESSAGES[params.error] ?? {
      title: "Acesso negado",
      body: "Não foi possível acessar sua conta. Entre em contato com o suporte.",
    };

    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px", borderRadius: t.radiusMd,
        background: "#FEF2F2", border: "1px solid #FECACA",
        marginBottom: 20,
      }}>
        <AlertTriangle style={{ width: 16, height: 16, color: "#DC2626", flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#DC2626" }}>{msg.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#991B1B" }}>{msg.body}</p>
        </div>
      </div>
    );
  }

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
