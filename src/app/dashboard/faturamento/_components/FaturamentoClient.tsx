"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  Mail, Phone, TrendingUp, DollarSign, AlertTriangle,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Wallet, ShieldOff, BadgeCheck,
} from "lucide-react";
import { tenantConfig } from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

const MENSALIDADE  = 99;
const PAGE_SIZE    = 5;

// ── Helpers ───────────────────────────────────────────────────

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").padEnd(14, "0");
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function avatarGradient(name: string) {
  const palettes = [
    ["#0C6B64", "#2EC4B6"],
    ["#7C3AED", "#A78BFA"],
    ["#1D4ED8", "#60A5FA"],
    ["#B45309", "#FBBF24"],
    ["#BE123C", "#FB7185"],
    ["#0369A1", "#38BDF8"],
    ["#065F46", "#34D399"],
  ];
  return `linear-gradient(135deg, ${palettes[name.charCodeAt(0) % palettes.length][0]}, ${palettes[name.charCodeAt(0) % palettes.length][1]})`;
}

// ── Status config ─────────────────────────────────────────────

type StatusKey = "ACTIVE" | "PENDING" | "INACTIVE";

const S: Record<StatusKey, { label: string; bg: string; color: string; border: string; dot: string }> = {
  ACTIVE:   { label: "Adimplente",   bg: "#F0FDF4", color: "#15803D", border: "#86EFAC", dot: "#22C55E" },
  PENDING:  { label: "Inadimplente", bg: "#FFFBEB", color: "#B45309", border: "#FCD34D", dot: "#F59E0B" },
  INACTIVE: { label: "Bloqueada",    bg: "#FFF1F2", color: "#BE123C", border: "#FCA5A5", dot: "#F43F5E" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = S[status as StatusKey] ?? S.INACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.01em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0,
        boxShadow: `0 0 0 3px ${cfg.dot}30` }} />
      {cfg.label}
    </span>
  );
}

// ── Select inline ─────────────────────────────────────────────

function StatusSelect({ company, onUpdate, disabled }: {
  company: CompanyRow;
  onUpdate: (id: string, s: StatusKey) => void;
  disabled: boolean;
}) {
  const cfg = S[company.status as StatusKey] ?? S.INACTIVE;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        disabled={disabled}
        value={company.status}
        onChange={(e) => onUpdate(company.userId, e.target.value as StatusKey)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          padding: "7px 32px 7px 12px",
          borderRadius: 10,
          border: `1.5px solid ${cfg.border}`,
          background: cfg.bg,
          color: cfg.color,
          fontSize: 12.5, fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none", opacity: disabled ? 0.55 : 1,
          transition: "all 0.15s", minWidth: 138,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <option value="ACTIVE">Adimplente</option>
        <option value="PENDING">Inadimplente</option>
        <option value="INACTIVE">Bloqueada</option>
      </select>
      {/* custom chevron */}
      <ChevronDown style={{
        position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
        width: 13, height: 13, color: cfg.color, pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Sort th ───────────────────────────────────────────────────

type SortKey = "name" | "cnpj" | "status" | "createdAt";

function Th({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey;
  dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th onClick={() => onSort(sortKey)} style={{
      padding: "11px 16px", fontSize: 10.5, fontWeight: 700,
      color: active ? t.primary : "#94A3B8",
      textTransform: "uppercase", letterSpacing: "0.08em",
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", textAlign: "left",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label} <Icon style={{ width: 11, height: 11 }} />
      </span>
    </th>
  );
}

// ── Paginação ─────────────────────────────────────────────────

function Pagination({ page, total, perPage, onChange }: {
  page: number; total: number; perPage: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  // página visíveis: max 5
  const pages: (number | "…")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9,
    border: `1.5px solid ${t.border}`,
    background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: t.textSecondary, transition: "all 0.15s",
    fontSize: 13, fontWeight: 600,
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", borderTop: `1px solid ${t.border}`, flexShrink: 0,
      flexWrap: "wrap", gap: 10,
    }}>
      <span style={{ fontSize: 12.5, color: t.textSecondary }}>
        {total === 0 ? "Nenhum resultado" : (
          <>Mostrando <strong style={{ color: t.textPrimary }}>{from}–{to}</strong> de{" "}
          <strong style={{ color: t.textPrimary }}>{total}</strong> empresa{total !== 1 ? "s" : ""}</>
        )}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Primeira */}
        <button type="button" disabled={page === 1} onClick={() => onChange(1)}
          style={{ ...btnBase, opacity: page === 1 ? 0.35 : 1 }}>
          <ChevronsLeft style={{ width: 14, height: 14 }} />
        </button>
        {/* Anterior */}
        <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}
          style={{ ...btnBase, opacity: page === 1 ? 0.35 : 1 }}>
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} style={{ width: 34, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>…</span>
          ) : (
            <button key={p} type="button" onClick={() => onChange(p as number)}
              style={{
                ...btnBase,
                background: p === page ? t.primary : "transparent",
                color: p === page ? "#fff" : t.textSecondary,
                borderColor: p === page ? t.primary : t.border,
                boxShadow: p === page ? `0 2px 8px ${t.primary}40` : "none",
                fontWeight: p === page ? 800 : 600,
              }}>
              {p}
            </button>
          )
        )}

        {/* Próxima */}
        <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)}
          style={{ ...btnBase, opacity: page === totalPages ? 0.35 : 1 }}>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
        {/* Última */}
        <button type="button" disabled={page === totalPages} onClick={() => onChange(totalPages)}
          style={{ ...btnBase, opacity: page === totalPages ? 0.35 : 1 }}>
          <ChevronsRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

// ── Estilos base de células ───────────────────────────────────

const td: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const thStatic: React.CSSProperties = {
  padding: "11px 14px",
  fontSize: 10.5, fontWeight: 700,
  color: "#94A3B8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  textAlign: "left" as const,
  whiteSpace: "nowrap" as const,
};

// ── Filtros ───────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL",      label: "Todas",         icon: <Wallet      style={{ width: 12, height: 12 }} /> },
  { value: "ACTIVE",   label: "Adimplentes",   icon: <BadgeCheck  style={{ width: 12, height: 12 }} /> },
  { value: "PENDING",  label: "Inadimplentes", icon: <AlertTriangle style={{ width: 12, height: 12 }} /> },
  { value: "INACTIVE", label: "Bloqueadas",    icon: <ShieldOff   style={{ width: 12, height: 12 }} /> },
];

// ── Componente principal ──────────────────────────────────────

export function FaturamentoClient({ initialData }: { initialData: CompanyRow[] }) {
  const [data,      setData]    = useState<CompanyRow[]>(initialData);
  const [search,    setSearch]  = useState("");
  const [filter,    setFilter]  = useState("ALL");
  const [sortKey,   setSortKey] = useState<SortKey>("createdAt");
  const [sortDir,   setSortDir] = useState<"asc" | "desc">("desc");
  const [page,      setPage]    = useState(1);
  const [isPending, startTrans] = useTransition();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function handleFilter(v: string) { setFilter(v); setPage(1); }
  function handleSearch(v: string) { setSearch(v); setPage(1); }

  function handleUpdate(userId: string, status: StatusKey) {
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
  const mrr   = counts.active  * MENSALIDADE;
  const risco = counts.pending * MENSALIDADE;

  const filtered = useMemo(() => {
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

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ══ CARDS ══════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>

        {/* MRR — destaque */}
        <div style={{
          background: "linear-gradient(135deg, #0C6B64 0%, #1AA99F 60%, #2EC4B6 100%)",
          borderRadius: 18, padding: "22px 22px 20px",
          boxShadow: "0 8px 32px rgba(12,107,100,0.28), 0 2px 8px rgba(0,0,0,0.08)",
          position: "relative", overflow: "hidden",
          gridColumn: "span 1",
        }}>
          {/* decorative circle */}
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
            backdropFilter: "blur(6px)",
          }}>
            <TrendingUp style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Receita Mensal (MRR)
          </p>
          <p style={{ margin: "6px 0 4px", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px" }}>
            {formatCurrency(mrr)}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.60)" }}>
            {counts.active} empresa{counts.active !== 1 ? "s" : ""} ativas
          </p>
        </div>

        {/* Total */}
        {[
          {
            icon: <Building2 style={{ width: 18, height: 18 }} />,
            iconBg: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
            iconShadow: "rgba(46,196,182,0.35)",
            label: "Total de Empresas",
            value: counts.total,
            sub: "cadastradas na plataforma",
            bg: t.surface, border: t.border,
            labelColor: "#94A3B8", valueColor: t.textPrimary, subColor: t.textSecondary,
          },
          {
            icon: <CheckCircle2 style={{ width: 18, height: 18 }} />,
            iconBg: "linear-gradient(135deg, #059669, #10B981)",
            iconShadow: "rgba(16,185,129,0.35)",
            label: "Adimplentes",
            value: counts.active,
            sub: "pagamento em dia",
            bg: "#F0FDF4", border: "#86EFAC",
            labelColor: "#4ADE80", valueColor: "#15803D", subColor: "#16A34A",
          },
          {
            icon: <AlertTriangle style={{ width: 18, height: 18 }} />,
            iconBg: "linear-gradient(135deg, #B45309, #F59E0B)",
            iconShadow: "rgba(245,158,11,0.35)",
            label: "Inadimplentes",
            value: counts.pending,
            sub: `risco ${formatCurrency(risco)}/mês`,
            bg: "#FFFBEB", border: "#FCD34D",
            labelColor: "#FCD34D", valueColor: "#B45309", subColor: "#D97706",
          },
          {
            icon: <ShieldOff style={{ width: 18, height: 18 }} />,
            iconBg: "linear-gradient(135deg, #BE123C, #F43F5E)",
            iconShadow: "rgba(244,63,94,0.35)",
            label: "Bloqueadas",
            value: counts.inactive,
            sub: "sem acesso à plataforma",
            bg: "#FFF1F2", border: "#FCA5A5",
            labelColor: "#FCA5A5", valueColor: "#BE123C", subColor: "#E11D48",
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: card.bg, border: `1px solid ${card.border}`,
            borderRadius: 18, padding: "20px 22px",
            display: "flex", flexDirection: "column", gap: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: card.iconBg, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 10,
              boxShadow: `0 4px 14px ${card.iconShadow}`,
            }}>
              {card.icon}
            </div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: card.labelColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {card.label}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 30, fontWeight: 900, color: card.valueColor, lineHeight: 1, letterSpacing: "-0.5px" }}>
              {card.value}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: card.subColor }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ══ TABELA ═════════════════════════════════════════ */}
      <div style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)",
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}>

        {/* ── Toolbar ── */}
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", gap: 12,
          flexWrap: "wrap", background: t.surface,
        }}>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            background: t.background, borderRadius: 12,
            padding: "9px 14px", flex: 1, minWidth: 200,
            border: `1.5px solid ${t.border}`,
            transition: "border-color 0.15s",
          }}
            onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = t.primary; }}
            onBlurCapture={(e)  => { (e.currentTarget as HTMLElement).style.borderColor = t.border;  }}
          >
            <Search style={{ width: 14, height: 14, color: "#94A3B8", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar empresa, CNPJ ou e-mail…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: t.textPrimary, width: "100%",
              }}
            />
            {search && (
              <button type="button" onClick={() => handleSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer",
                  color: "#94A3B8", display: "flex", padding: 0 }}>
                <XCircle style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          <div style={{ width: 1, height: 30, background: t.border, flexShrink: 0 }} />

          {/* Filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button key={f.value} type="button" onClick={() => handleFilter(f.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 13px", borderRadius: 10,
                    border: active ? `1.5px solid ${t.primary}` : `1.5px solid ${t.border}`,
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    background: active ? `${t.primary}12` : t.background,
                    color: active ? t.primary : t.textSecondary,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: active ? `0 2px 8px ${t.primary}25` : "none",
                  }}
                >
                  <span style={{ color: active ? t.primary : "#94A3B8", display: "flex" }}>{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: t.background, borderBottom: `1px solid ${t.border}` }}>
                <Th label="Empresa"       sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"          sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={thStatic}>Contato</th>
                <th style={thStatic}>Mensalidade</th>
                <Th label="Situação"      sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro"      sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={thStatic}>Alterar situação</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 24px" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 20,
                        background: t.background, border: `1.5px dashed ${t.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <DollarSign style={{ width: 26, height: 26, color: "#CBD5E1" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t.textPrimary }}>Nenhuma empresa encontrada</p>
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: t.textSecondary }}>
                          {search || filter !== "ALL" ? "Tente ajustar os filtros ou a busca." : "Empresas cadastradas aparecerão aqui."}
                        </p>
                      </div>
                      {(search || filter !== "ALL") && (
                        <button type="button" onClick={() => { handleFilter("ALL"); handleSearch(""); }}
                          style={{
                            padding: "8px 18px", borderRadius: 10, border: `1.5px solid ${t.primary}`,
                            background: `${t.primary}10`, color: t.primary, fontSize: 13,
                            fontWeight: 700, cursor: "pointer",
                          }}>
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : pageRows.map((c) => (
                <tr
                  key={c.id}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${t.primary}07`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {/* Empresa — avatar + nome em 1 linha */}
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: avatarGradient(c.tradeName ?? c.name),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 900,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                      }}>
                        {(c.tradeName ?? c.name).charAt(0).toUpperCase()}
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: t.textPrimary,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: 180,
                      }}>
                        {c.tradeName ?? c.name}
                      </span>
                    </div>
                  </td>

                  {/* CNPJ */}
                  <td style={td}>
                    <code style={{
                      fontSize: 11.5, color: t.textSecondary,
                      background: t.background,
                      padding: "3px 8px", borderRadius: 6,
                      border: `1px solid ${t.border}`,
                      whiteSpace: "nowrap", letterSpacing: "0.01em",
                    }}>
                      {formatCNPJ(c.cnpj)}
                    </code>
                  </td>

                  {/* Contato — e-mail + telefone inline */}
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: t.textPrimary }}>
                        <Mail style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
                        {c.email}
                      </span>
                      {c.phone && (
                        <>
                          <span style={{ color: t.border }}>·</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: t.textSecondary }}>
                            <Phone style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
                            {c.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Mensalidade */}
                  <td style={td}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: t.textPrimary, whiteSpace: "nowrap" }}>
                      {formatCurrency(MENSALIDADE)}
                      <span style={{ fontSize: 11, fontWeight: 500, color: t.textSecondary, marginLeft: 4 }}>/mês</span>
                    </span>
                  </td>

                  {/* Situação */}
                  <td style={td}>
                    <StatusPill status={c.status} />
                  </td>

                  {/* Cadastro */}
                  <td style={td}>
                    <span style={{ fontSize: 12.5, color: t.textSecondary, whiteSpace: "nowrap" }}>
                      {formatDate(c.createdAt)}
                    </span>
                  </td>

                  {/* Select */}
                  <td style={td}>
                    <StatusSelect company={c} onUpdate={handleUpdate} disabled={isPending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Paginação ── */}
        <Pagination
          page={page}
          total={filtered.length}
          perPage={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
