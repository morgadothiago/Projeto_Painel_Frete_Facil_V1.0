"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  Mail, Phone, SlidersHorizontal, TrendingUp, DollarSign,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react";
import { tenantConfig } from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

// ── Mensalidade fixa por empresa ──────────────────────────────
const MENSALIDADE = 99; // R$/mês

// ── Helpers ───────────────────────────────────────────────────

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").padEnd(14, "0");
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function avatarColor(name: string) {
  const colors = [
    ["#0C6B64", "#2EC4B6"],
    ["#7C3AED", "#A78BFA"],
    ["#1D4ED8", "#60A5FA"],
    ["#B45309", "#FCD34D"],
    ["#BE123C", "#FB7185"],
  ];
  const i = name.charCodeAt(0) % colors.length;
  return `linear-gradient(135deg, ${colors[i][0]}, ${colors[i][1]})`;
}

// ── Status config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE:   { label: "Adimplente",  bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  PENDING:  { label: "Inadimplente",bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  INACTIVE: { label: "Bloqueada",   bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ── Select inline de status ───────────────────────────────────

function StatusSelect({
  company, onUpdate, disabled,
}: {
  company:  CompanyRow;
  onUpdate: (userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") => void;
  disabled: boolean;
}) {
  const options: { value: "ACTIVE" | "PENDING" | "INACTIVE"; label: string; color: string }[] = [
    { value: "ACTIVE",   label: "Adimplente",   color: "#059669" },
    { value: "PENDING",  label: "Inadimplente", color: "#D97706" },
    { value: "INACTIVE", label: "Bloqueada",    color: "#DC2626" },
  ];

  const colorMap: Record<string, string> = {
    ACTIVE: "#059669", PENDING: "#D97706", INACTIVE: "#DC2626",
  };
  const bgMap: Record<string, string> = {
    ACTIVE: "#ECFDF5", PENDING: "#FFFBEB", INACTIVE: "#FEF2F2",
  };

  return (
    <select
      disabled={disabled}
      value={company.status}
      onChange={(e) => onUpdate(company.userId, e.target.value as "ACTIVE" | "PENDING" | "INACTIVE")}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        padding: "6px 28px 6px 10px",
        borderRadius: 8,
        border: `1.5px solid ${colorMap[company.status] ?? t.border}`,
        background: bgMap[company.status] ?? t.background,
        color: colorMap[company.status] ?? t.textPrimary,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748B' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s",
        minWidth: 130,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Sort header ───────────────────────────────────────────────

type SortKey = "name" | "cnpj" | "status" | "createdAt";

function Th({
  label, sortKey, current, dir, onSort,
}: {
  label: string; sortKey: SortKey; current: SortKey;
  dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "12px 20px", fontSize: 11, fontWeight: 700,
        color: active ? t.primary : "#94A3B8",
        textTransform: "uppercase", letterSpacing: "0.07em",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", textAlign: "left",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label} <Icon style={{ width: 12, height: 12 }} />
      </span>
    </th>
  );
}

// ── Filtros ───────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL",      label: "Todas"        },
  { value: "ACTIVE",   label: "Adimplentes"  },
  { value: "PENDING",  label: "Inadimplentes"},
  { value: "INACTIVE", label: "Bloqueadas"   },
];

// ── Componente principal ──────────────────────────────────────

export function FaturamentoClient({ initialData }: { initialData: CompanyRow[] }) {
  const [data,      setData]    = useState<CompanyRow[]>(initialData);
  const [search,    setSearch]  = useState("");
  const [filter,    setFilter]  = useState("ALL");
  const [sortKey,   setSortKey] = useState<SortKey>("createdAt");
  const [sortDir,   setSortDir] = useState<"asc" | "desc">("desc");
  const [isPending, startTrans] = useTransition();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleUpdate(userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") {
    startTrans(async () => {
      const res = await updateCompanyStatus(userId, status);
      if (res.ok) setData((prev) => prev.map((c) => c.userId === userId ? { ...c, status } : c));
    });
  }

  // Contagens sempre sobre todos os dados (não filtrados)
  const counts = {
    total:    data.length,
    active:   data.filter((c) => c.status === "ACTIVE").length,
    pending:  data.filter((c) => c.status === "PENDING").length,
    inactive: data.filter((c) => c.status === "INACTIVE").length,
  };

  const mrr       = counts.active  * MENSALIDADE;
  const risco     = counts.pending * MENSALIDADE;

  const rows = useMemo(() => {
    let r = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tradeName ?? "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.cnpj.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
      );
    }
    if (filter !== "ALL") r = r.filter((c) => c.status === filter);
    r.sort((a, b) => {
      const va = a[sortKey] instanceof Date ? (a[sortKey] as Date).toISOString() : String(a[sortKey]);
      const vb = b[sortKey] instanceof Date ? (b[sortKey] as Date).toISOString() : String(b[sortKey]);
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return r;
  }, [data, search, filter, sortKey, sortDir]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>

      {/* ── Stats cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, flexShrink: 0 }}>

        {/* MRR */}
        <div style={{
          background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
          borderRadius: 16, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 4px 16px rgba(46,196,182,0.30)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,255,255,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp style={{ width: 18, height: 18, color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Receita mensal
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {formatCurrency(mrr)}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.70)" }}>
              {counts.active} empresa{counts.active !== 1 ? "s" : ""} ativas
            </p>
          </div>
        </div>

        {/* Total empresas */}
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, #0C6B64, ${t.primary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <Building2 style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Total
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: t.textPrimary, lineHeight: 1 }}>
              {counts.total}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: t.textSecondary }}>
              empresas cadastradas
            </p>
          </div>
        </div>

        {/* Adimplentes */}
        <div style={{
          background: "#ECFDF5", border: "1px solid #A7F3D0",
          borderRadius: 16, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "#059669",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <CheckCircle2 style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#6EE7B7", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Adimplentes
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: "#059669", lineHeight: 1 }}>
              {counts.active}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#10B981" }}>
              pagamento em dia
            </p>
          </div>
        </div>

        {/* Inadimplentes */}
        <div style={{
          background: "#FFFBEB", border: "1px solid #FDE68A",
          borderRadius: 16, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "#D97706",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <Clock style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#FDE68A", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Inadimplentes
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: "#D97706", lineHeight: 1 }}>
              {counts.pending}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#F59E0B" }}>
              risco {formatCurrency(risco)}/mês
            </p>
          </div>
        </div>

        {/* Bloqueadas */}
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA",
          borderRadius: 16, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "#DC2626",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <XCircle style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#FECACA", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Bloqueadas
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: "#DC2626", lineHeight: 1 }}>
              {counts.inactive}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#EF4444" }}>
              sem acesso à plataforma
            </p>
          </div>
        </div>

      </div>

      {/* ── Tabela ── */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        flex: 1, minHeight: 0,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        opacity: isPending ? 0.65 : 1,
        transition: "opacity 0.2s",
      }}>

        {/* Toolbar */}
        <div style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", gap: 12,
          flexShrink: 0, flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            background: t.background, borderRadius: 10,
            padding: "8px 14px", flex: 1, minWidth: 220,
            border: `1.5px solid ${t.border}`,
          }}>
            <Search style={{ width: 14, height: 14, color: "#94A3B8", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: t.textPrimary, width: "100%",
              }}
            />
          </div>

          <div style={{ width: 1, height: 28, background: t.border, flexShrink: 0 }} />

          {/* Filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <SlidersHorizontal style={{ width: 13, height: 13, color: "#94A3B8", marginRight: 6, flexShrink: 0 }} />
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: "6px 13px", borderRadius: 8,
                    border: active ? `1.5px solid ${t.primary}` : "1.5px solid transparent",
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    background: active ? `${t.primary}12` : "transparent",
                    color: active ? t.primary : t.textSecondary,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = t.textPrimary; e.currentTarget.style.background = t.background; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = t.textSecondary; e.currentTarget.style.background = "transparent"; } }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr style={{ background: t.background, borderBottom: `1px solid ${t.border}` }}>
                <Th label="Empresa"   sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"      sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left" }}>
                  Contato
                </th>
                <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", whiteSpace: "nowrap" }}>
                  Mensalidade
                </th>
                <Th label="Situação"  sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro"  sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", textAlign: "left" }}>
                  Alterar situação
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 12,
                      padding: "64px 24px",
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 18,
                        background: t.background,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <DollarSign style={{ width: 24, height: 24, color: "#CBD5E1" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.textPrimary }}>
                          Nenhuma empresa encontrada
                        </p>
                        <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textSecondary }}>
                          {search || filter !== "ALL"
                            ? "Tente ajustar os filtros."
                            : "Empresas cadastradas aparecerão aqui."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : "none",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${t.primary}05`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Empresa */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                          background: avatarColor(c.tradeName ?? c.name),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 14, fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }}>
                          {(c.tradeName ?? c.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: t.textPrimary, lineHeight: 1.3 }}>
                            {c.tradeName ?? c.name}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textSecondary }}>
                            {c.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CNPJ */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 12.5, color: t.textSecondary,
                        fontFamily: "'Geist Mono', monospace",
                        background: t.background,
                        padding: "3px 8px", borderRadius: 6,
                        border: `1px solid ${t.border}`,
                      }}>
                        {formatCNPJ(c.cnpj)}
                      </span>
                    </td>

                    {/* Contato */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: t.textPrimary }}>
                          <Mail style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textSecondary }}>
                            <Phone style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Mensalidade */}
                    <td style={{ padding: "14px 20px" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: t.textPrimary }}>
                          {formatCurrency(MENSALIDADE)}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: t.textSecondary }}>
                          por mês
                        </p>
                      </div>
                    </td>

                    {/* Situação */}
                    <td style={{ padding: "14px 20px" }}>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Data cadastro */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 12.5, color: t.textSecondary, whiteSpace: "nowrap" }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Select de situação */}
                    <td style={{ padding: "14px 20px" }}>
                      <StatusSelect
                        company={c}
                        onUpdate={handleUpdate}
                        disabled={isPending}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div style={{
            padding: "10px 20px",
            borderTop: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, color: t.textSecondary }}>
              Exibindo <strong style={{ color: t.textPrimary }}>{rows.length}</strong> de{" "}
              <strong style={{ color: t.textPrimary }}>{data.length}</strong> empresa{data.length !== 1 ? "s" : ""}
            </span>
            {(filter !== "ALL" || search) && (
              <button
                type="button"
                onClick={() => { setFilter("ALL"); setSearch(""); }}
                style={{
                  fontSize: 12, color: t.primary, background: "none",
                  border: "none", cursor: "pointer", fontWeight: 600, padding: 0,
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
