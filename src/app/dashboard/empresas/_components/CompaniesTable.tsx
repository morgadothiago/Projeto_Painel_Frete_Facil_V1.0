"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  MoreHorizontal, UserCheck, UserX, ChevronUp, ChevronDown,
  ChevronsUpDown, SlidersHorizontal, Mail, Phone,
} from "lucide-react";
import { tenantConfig }      from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; color: string; dot: string;
}> = {
  ACTIVE:   { label: "Ativa",     bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
  PENDING:  { label: "Pendente",  bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  INACTIVE: { label: "Inativa",   bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.dot, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").padEnd(14, "0");
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
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

// ── Actions dropdown ──────────────────────────────────────────────────────────

function ActionsMenu({
  company, onUpdate,
}: {
  company:  CompanyRow;
  onUpdate: (userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") => void;
}) {
  const [open, setOpen] = useState(false);

  const action = company.status === "PENDING"
    ? { label: "Ativar empresa",    icon: <UserCheck style={{ width: 13, height: 13 }} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" }
    : company.status === "ACTIVE"
    ? { label: "Desativar empresa", icon: <UserX     style={{ width: 13, height: 13 }} />, status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" }
    : { label: "Reativar empresa",  icon: <UserCheck style={{ width: 13, height: 13 }} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          border: `1.5px solid ${t.border}`,
          background: open ? t.background : "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? t.primary : t.textSecondary,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.background;
          e.currentTarget.style.color = t.primary;
          e.currentTarget.style.borderColor = t.primary;
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = t.textSecondary;
            e.currentTarget.style.borderColor = t.border;
          }
        }}
      >
        <MoreHorizontal style={{ width: 15, height: 15 }} />
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)",
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
            zIndex: 20, minWidth: 190, overflow: "hidden",
            padding: 4,
          }}>
            <button
              type="button"
              onClick={() => { onUpdate(company.userId, action.status); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                width: "100%", padding: "9px 12px",
                border: "none", background: "transparent",
                fontSize: 13, fontWeight: 600, color: action.color,
                cursor: "pointer", borderRadius: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = action.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {action.icon}
              {action.label}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sort header ───────────────────────────────────────────────────────────────

type SortKey = "name" | "cnpj" | "status" | "createdAt";

function Th({
  label, sortKey, current, dir, onSort,
}: {
  label:   string;
  sortKey: SortKey;
  current: SortKey;
  dir:     "asc" | "desc";
  onSort:  (k: SortKey) => void;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "12px 20px",
        fontSize: 11, fontWeight: 700,
        color: active ? t.primary : "#94A3B8",
        textTransform: "uppercase", letterSpacing: "0.07em",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        textAlign: "left",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        <Icon style={{ width: 12, height: 12 }} />
      </span>
    </th>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL",      label: "Todas"     },
  { value: "ACTIVE",   label: "Ativas"    },
  { value: "PENDING",  label: "Pendentes" },
  { value: "INACTIVE", label: "Inativas"  },
];

export function CompaniesTable({ initialData }: { initialData: CompanyRow[] }) {
  const [data,        setData]      = useState<CompanyRow[]>(initialData);
  const [search,      setSearch]    = useState("");
  const [filter,      setFilter]    = useState("ALL");
  const [sortKey,     setSortKey]   = useState<SortKey>("createdAt");
  const [sortDir,     setSortDir]   = useState<"asc" | "desc">("desc");
  const [isPending,   startTrans]   = useTransition();

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

  const counts = {
    total:    data.length,
    active:   data.filter((c) => c.status === "ACTIVE").length,
    pending:  data.filter((c) => c.status === "PENDING").length,
    inactive: data.filter((c) => c.status === "INACTIVE").length,
  };

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

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flexShrink: 0 }}>
        {[
          {
            label: "Total", value: counts.total,
            icon: <Building2 style={{ width: 16, height: 16 }} />,
            iconBg: `linear-gradient(135deg, #0C6B64, ${t.primary})`,
            iconColor: "#fff",
            valueBg: t.surface, valueFg: t.textPrimary, border: t.border,
          },
          {
            label: "Ativas", value: counts.active,
            icon: <CheckCircle2 style={{ width: 16, height: 16 }} />,
            iconBg: "#059669", iconColor: "#fff",
            valueBg: "#ECFDF5", valueFg: "#059669", border: "#A7F3D0",
          },
          {
            label: "Pendentes", value: counts.pending,
            icon: <Clock style={{ width: 16, height: 16 }} />,
            iconBg: "#D97706", iconColor: "#fff",
            valueBg: "#FFFBEB", valueFg: "#D97706", border: "#FDE68A",
          },
          {
            label: "Inativas", value: counts.inactive,
            icon: <XCircle style={{ width: 16, height: 16 }} />,
            iconBg: "#94A3B8", iconColor: "#fff",
            valueBg: "#F8FAFC", valueFg: "#64748B", border: "#E2E8F0",
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: card.valueBg,
            border: `1px solid ${card.border}`,
            borderRadius: 16,
            padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: card.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: card.iconColor,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {card.label}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: card.valueFg, lineHeight: 1 }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
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

          {/* Divider */}
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
                <Th label="Empresa"  sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"     sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left" }}>
                  Contato
                </th>
                <Th label="Status"   sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ width: 56 }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
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
                        <Building2 style={{ width: 24, height: 24, color: "#CBD5E1" }} />
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
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${t.primary}05`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Empresa */}
                    <td style={{ padding: "16px 20px" }}>
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
                    <td style={{ padding: "16px 20px" }}>
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
                    <td style={{ padding: "16px 20px" }}>
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

                    {/* Status */}
                    <td style={{ padding: "16px 20px" }}>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Data */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 12.5, color: t.textSecondary, whiteSpace: "nowrap" }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <ActionsMenu company={c} onUpdate={handleUpdate} />
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
              Exibindo <strong style={{ color: t.textPrimary }}>{rows.length}</strong> de <strong style={{ color: t.textPrimary }}>{data.length}</strong> empresa{data.length !== 1 ? "s" : ""}
            </span>
            {filter !== "ALL" || search ? (
              <button
                type="button"
                onClick={() => { setFilter("ALL"); setSearch(""); }}
                style={{
                  fontSize: 12, color: t.primary, background: "none",
                  border: "none", cursor: "pointer", fontWeight: 600,
                  padding: 0,
                }}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
