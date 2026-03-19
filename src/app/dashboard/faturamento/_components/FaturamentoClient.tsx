"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  Mail, Phone, TrendingUp, DollarSign, AlertTriangle,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight,
  Wallet, ShieldOff, BadgeCheck,
} from "lucide-react";
import { toast }         from "sonner";
import { tenantConfig } from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

const MENSALIDADE = 99;
const PAGE_SIZE   = 5;

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
  const p = [
    ["#0C6B64","#2EC4B6"],["#7C3AED","#A78BFA"],["#1D4ED8","#60A5FA"],
    ["#B45309","#FBBF24"],["#BE123C","#FB7185"],["#0369A1","#38BDF8"],["#065F46","#34D399"],
  ];
  const i = name.charCodeAt(0) % p.length;
  return `linear-gradient(135deg, ${p[i][0]}, ${p[i][1]})`;
}

// ── Status ────────────────────────────────────────────────────

type StatusKey = "ACTIVE" | "PENDING" | "INACTIVE";

const S: Record<StatusKey, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE:   { label: "Adimplente",   bg: "#ECFDF5", color: "#15803D", dot: "#22C55E" },
  PENDING:  { label: "Inadimplente", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  INACTIVE: { label: "Bloqueada",    bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = S[status as StatusKey] ?? S.INACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ── Select ────────────────────────────────────────────────────

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
          padding: "6px 30px 6px 11px",
          borderRadius: 10, border: "none",
          background: cfg.bg, color: cfg.color,
          fontSize: 12.5, fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none", opacity: disabled ? 0.5 : 1,
          transition: "opacity 0.15s", minWidth: 132,
        }}
      >
        <option value="ACTIVE">Adimplente</option>
        <option value="PENDING">Inadimplente</option>
        <option value="INACTIVE">Bloqueada</option>
      </select>
      <ChevronDown style={{
        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
        width: 12, height: 12, color: cfg.color, pointerEvents: "none",
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
      padding: "10px 14px", fontSize: 10.5, fontWeight: 700,
      color: active ? t.primary : "#B0BAC9",
      textTransform: "uppercase", letterSpacing: "0.08em",
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", textAlign: "left",
      background: "transparent",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {label} <Icon style={{ width: 10, height: 10 }} />
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

  const btn = (onClick: () => void, disabled: boolean, children: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: "none", background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: disabled ? "#CBD5E1" : t.textSecondary,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = t.background; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );

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

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 20px", flexWrap: "wrap", gap: 8,
    }}>
      <span style={{ fontSize: 12.5, color: t.textSecondary }}>
        {total === 0 ? "Nenhum resultado" : (
          <>Mostrando <strong style={{ color: t.textPrimary }}>{from}–{to}</strong> de{" "}
          <strong style={{ color: t.textPrimary }}>{total}</strong> empresa{total !== 1 ? "s" : ""}</>
        )}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {btn(() => onChange(page - 1), page === 1, <ChevronLeft style={{ width: 14, height: 14 }} />)}

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`el-${idx}`} style={{ width: 32, textAlign: "center", color: "#B0BAC9", fontSize: 13 }}>…</span>
          ) : (
            <button key={p} type="button" onClick={() => onChange(p as number)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: "none",
              background: p === page ? t.primary : "transparent",
              color: p === page ? "#fff" : t.textSecondary,
              fontSize: 13, fontWeight: p === page ? 800 : 500,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: p === page ? `0 2px 8px ${t.primary}40` : "none",
            }}
              onMouseEnter={(e) => { if (p !== page) (e.currentTarget as HTMLElement).style.background = t.background; }}
              onMouseLeave={(e) => { if (p !== page) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {p}
            </button>
          )
        )}

        {btn(() => onChange(page + 1), page === totalPages, <ChevronRight style={{ width: 14, height: 14 }} />)}
      </div>
    </div>
  );
}

// ── Filtros ───────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL",      label: "Todas",         icon: <Wallet        style={{ width: 12, height: 12 }} /> },
  { value: "ACTIVE",   label: "Adimplentes",   icon: <BadgeCheck    style={{ width: 12, height: 12 }} /> },
  { value: "PENDING",  label: "Inadimplentes", icon: <AlertTriangle style={{ width: 12, height: 12 }} /> },
  { value: "INACTIVE", label: "Bloqueadas",    icon: <ShieldOff     style={{ width: 12, height: 12 }} /> },
];

// ── td base ───────────────────────────────────────────────────

const TD: React.CSSProperties = { padding: "11px 14px", verticalAlign: "middle", whiteSpace: "nowrap" };

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

  const TOAST_MSG: Record<StatusKey, { label: string; fn: typeof toast.success }> = {
    ACTIVE:   { label: "Empresa reativada com sucesso.",          fn: toast.success },
    PENDING:  { label: "Empresa marcada como inadimplente.",      fn: toast.warning },
    INACTIVE: { label: "Empresa bloqueada. Notificação enviada.", fn: toast.error   },
  };

  function handleUpdate(userId: string, status: StatusKey) {
    startTrans(async () => {
      const res = await updateCompanyStatus(userId, status);
      if (res.ok) {
        setData((prev) => prev.map((c) => c.userId === userId ? { ...c, status } : c));
        const msg = TOAST_MSG[status];
        msg.fn(msg.label, { description: "O usuário receberá uma notificação." });
      } else {
        toast.error("Erro ao alterar situação.", { description: res.error ?? "Tente novamente." });
      }
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ══ CARDS ══════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>

        {/* MRR */}
        <div style={{
          background: "linear-gradient(135deg, #0C6B64 0%, #1AA99F 55%, #2EC4B6 100%)",
          borderRadius: 20, padding: "22px 22px 20px",
          boxShadow: "0 8px 32px rgba(12,107,100,0.25)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -24, right: -24, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -16, right: 32, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <TrendingUp style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Receita Mensal</p>
          <p style={{ margin: "5px 0 3px", fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px" }}>{formatCurrency(mrr)}</p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{counts.active} empresa{counts.active !== 1 ? "s" : ""} ativas</p>
        </div>

        {/* Outros cards */}
        {([
          { icon: <Building2 style={{ width: 18, height: 18 }} />, iconBg: "linear-gradient(135deg,#0C6B64,#2EC4B6)", shadow: "rgba(46,196,182,0.30)", label: "Total", value: counts.total, sub: "cadastradas", bg: "#fff", lc: "#94A3B8", vc: t.textPrimary, sc: t.textSecondary },
          { icon: <CheckCircle2 style={{ width: 18, height: 18 }} />, iconBg: "linear-gradient(135deg,#059669,#10B981)", shadow: "rgba(16,185,129,0.30)", label: "Adimplentes", value: counts.active, sub: "em dia", bg: "#F0FDF4", lc: "#86EFAC", vc: "#15803D", sc: "#16A34A" },
          { icon: <AlertTriangle style={{ width: 18, height: 18 }} />, iconBg: "linear-gradient(135deg,#B45309,#F59E0B)", shadow: "rgba(245,158,11,0.30)", label: "Inadimplentes", value: counts.pending, sub: `risco ${formatCurrency(risco)}/mês`, bg: "#FFFBEB", lc: "#FDE68A", vc: "#B45309", sc: "#D97706" },
          { icon: <ShieldOff style={{ width: 18, height: 18 }} />, iconBg: "linear-gradient(135deg,#BE123C,#F43F5E)", shadow: "rgba(244,63,94,0.30)", label: "Bloqueadas", value: counts.inactive, sub: "sem acesso", bg: "#FFF1F2", lc: "#FCA5A5", vc: "#BE123C", sc: "#E11D48" },
        ] as const).map((c) => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: `0 4px 14px ${c.shadow}` }}>
              {c.icon}
            </div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.lc, textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.label}</p>
            <p style={{ margin: "3px 0 2px", fontSize: 30, fontWeight: 900, color: c.vc, lineHeight: 1, letterSpacing: "-0.5px" }}>{c.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: c.sc }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ══ PAINEL DA TABELA ══════════════════════════════ */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        overflow: "hidden",
        opacity: isPending ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}>

        {/* ── Toolbar ── */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8FAFC", borderRadius: 12,
            padding: "9px 14px", flex: 1, minWidth: 200,
          }}>
            <Search style={{ width: 14, height: 14, color: "#B0BAC9", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar empresa, CNPJ ou e-mail…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: t.textPrimary, width: "100%" }}
            />
            {search && (
              <button type="button" onClick={() => handleSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#B0BAC9", display: "flex", padding: 0 }}>
                <XCircle style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button key={f.value} type="button" onClick={() => handleFilter(f.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 13px", borderRadius: 10, border: "none",
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    background: active ? `${t.primary}14` : "#F8FAFC",
                    color: active ? t.primary : "#6B7280",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <span style={{ color: active ? t.primary : "#B0BAC9", display: "flex" }}>{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Separador sutil ── */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "0 20px" }} />

        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>

            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                <Th label="Empresa"   sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"      sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "10px 14px", fontSize: 10.5, fontWeight: 700, color: "#B0BAC9", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", whiteSpace: "nowrap" }}>Contato</th>
                <th style={{ padding: "10px 14px", fontSize: 10.5, fontWeight: 700, color: "#B0BAC9", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", whiteSpace: "nowrap" }}>Mensalidade</th>
                <Th label="Situação"  sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro"  sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "10px 14px", fontSize: 10.5, fontWeight: 700, color: "#B0BAC9", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", whiteSpace: "nowrap" }}>Alterar situação</th>
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "56px 24px" }}>
                      <div style={{ width: 60, height: 60, borderRadius: 18, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <DollarSign style={{ width: 26, height: 26, color: "#CBD5E1" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: t.textPrimary }}>Nenhuma empresa encontrada</p>
                        <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textSecondary }}>
                          {search || filter !== "ALL" ? "Tente ajustar os filtros ou a busca." : "Empresas cadastradas aparecerão aqui."}
                        </p>
                      </div>
                      {(search || filter !== "ALL") && (
                        <button type="button" onClick={() => { handleFilter("ALL"); handleSearch(""); }}
                          style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: `${t.primary}14`, color: t.primary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : pageRows.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ background: i % 2 === 1 ? "#FAFBFC" : "#fff", transition: "background 0.12s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${t.primary}08`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 1 ? "#FAFBFC" : "#fff"; }}
                >
                  {/* Empresa */}
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: avatarGradient(c.tradeName ?? c.name),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 900,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      }}>
                        {(c.tradeName ?? c.name).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                        {c.tradeName ?? c.name}
                      </span>
                    </div>
                  </td>

                  {/* CNPJ */}
                  <td style={TD}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#64748B", fontFamily: "monospace", letterSpacing: "0.02em", background: "#F1F5F9", padding: "3px 8px", borderRadius: 6 }}>
                      {formatCNPJ(c.cnpj)}
                    </span>
                  </td>

                  {/* Contato */}
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: t.textPrimary }}>
                        <Mail style={{ width: 11, height: 11, color: "#B0BAC9", flexShrink: 0 }} />
                        {c.email}
                      </span>
                      {c.phone && (
                        <>
                          <span style={{ color: "#D1D5DB", fontSize: 12 }}>·</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#64748B" }}>
                            <Phone style={{ width: 11, height: 11, color: "#B0BAC9", flexShrink: 0 }} />
                            {c.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Mensalidade */}
                  <td style={TD}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: t.textPrimary }}>
                      {formatCurrency(MENSALIDADE)}
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", marginLeft: 3 }}>/mês</span>
                    </span>
                  </td>

                  {/* Situação */}
                  <td style={TD}><StatusPill status={c.status} /></td>

                  {/* Cadastro */}
                  <td style={TD}>
                    <span style={{ fontSize: 12.5, color: "#64748B" }}>{formatDate(c.createdAt)}</span>
                  </td>

                  {/* Alterar */}
                  <td style={TD}>
                    <StatusSelect company={c} onUpdate={handleUpdate} disabled={isPending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Paginação ── */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "0 20px" }} />
        <Pagination page={page} total={filtered.length} perPage={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}
