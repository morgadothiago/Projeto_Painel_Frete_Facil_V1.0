"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  MoreHorizontal, UserCheck, UserX, ChevronUp, ChevronDown,
  ChevronsUpDown, Mail, Phone, X,
} from "lucide-react";
import { tenantConfig }      from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  ACTIVE:   { label: "Ativa",    color: "#059669", dot: "#10B981", bg: "#ECFDF5" },
  PENDING:  { label: "Pendente", color: "#B45309", dot: "#F59E0B", bg: "#FFFBEB" },
  INACTIVE: { label: "Inativa",  color: "#94A3B8", dot: "#CBD5E1", bg: "#F8FAFC" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px 3px 7px",
      borderRadius: 20,
      background: cfg.bg,
      fontSize: 12, fontWeight: 600, color: cfg.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
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

function avatarGradient(name: string) {
  const palettes = [
    ["#0C6B64","#2EC4B6"], ["#7C3AED","#A78BFA"],
    ["#1D4ED8","#60A5FA"], ["#B45309","#FCD34D"],
    ["#BE123C","#FB7185"], ["#0369A1","#38BDF8"],
  ];
  return `linear-gradient(135deg, ${palettes[name.charCodeAt(0) % palettes.length][0]}, ${palettes[name.charCodeAt(0) % palettes.length][1]})`;
}

// ── Actions dropdown ──────────────────────────────────────────────────────────

function ActionsMenu({ company, onUpdate }: {
  company:  CompanyRow;
  onUpdate: (userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") => void;
}) {
  const [open, setOpen] = useState(false);

  const items =
    company.status === "ACTIVE"
      ? [
          { label: "Marcar como pendente", icon: <Clock size={13} />,    status: "PENDING"  as const, color: "#B45309", hoverBg: "#FFFBEB" },
          { label: "Bloquear empresa",     icon: <UserX size={13} />,    status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" },
        ]
      : company.status === "PENDING"
      ? [
          { label: "Ativar empresa",       icon: <UserCheck size={13} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" },
          { label: "Bloquear empresa",     icon: <UserX size={13} />,    status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" },
        ]
      : [
          { label: "Reativar empresa",     icon: <UserCheck size={13} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" },
        ];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 30, height: 30, borderRadius: 8,
          border: "none",
          background: open ? "#F1F5F9" : "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? t.primary : "#94A3B8",
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = t.primary; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; } }}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(0,0,0,0.10)",
            border: "1px solid #F1F5F9",
            zIndex: 20, minWidth: 200, padding: 6,
          }}>
            {items.map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => { onUpdate(company.userId, item.status); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "8px 11px",
                  border: "none", background: "transparent",
                  fontSize: 13, fontWeight: 500, color: item.color,
                  cursor: "pointer", borderRadius: 8,
                  transition: "background 0.12s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = item.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sort header ───────────────────────────────────────────────────────────────

type SortKey = "name" | "cnpj" | "status" | "createdAt";

function Th({ label, sortKey, current, dir, onSort, right }: {
  label:    string;
  sortKey:  SortKey;
  current:  SortKey;
  dir:      "asc" | "desc";
  onSort:   (k: SortKey) => void;
  right?:   boolean;
}) {
  const active = current === sortKey;
  const Icon   = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "0 20px 12px",
        fontSize: 11, fontWeight: 600,
        color: active ? t.primary : "#94A3B8",
        textTransform: "uppercase", letterSpacing: "0.08em",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        textAlign: right ? "right" : "left",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {label}
        <Icon size={10} />
      </span>
    </th>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL",      label: "Todas"     },
  { value: "ACTIVE",   label: "Ativas"    },
  { value: "PENDING",  label: "Pendentes" },
  { value: "INACTIVE", label: "Inativas"  },
];

const STAT_CARDS = (c: { total: number; active: number; pending: number; inactive: number }) => [
  { label: "Total",     value: c.total,    icon: <Building2   size={15} />, accent: "#0C6B64", light: "#F0FDFA" },
  { label: "Ativas",    value: c.active,   icon: <CheckCircle2 size={15} />, accent: "#059669", light: "#ECFDF5" },
  { label: "Pendentes", value: c.pending,  icon: <Clock        size={15} />, accent: "#B45309", light: "#FFFBEB" },
  { label: "Inativas",  value: c.inactive, icon: <XCircle      size={15} />, accent: "#94A3B8", light: "#F8FAFC" },
];

export function CompaniesTable({ initialData }: { initialData: CompanyRow[] }) {
  const [data,      setData]    = useState<CompanyRow[]>(initialData);
  const [search,    setSearch]  = useState("");
  const [filter,    setFilter]  = useState("ALL");
  const [sortKey,   setSortKey] = useState<SortKey>("createdAt");
  const [sortDir,   setSortDir] = useState<"asc" | "desc">("desc");
  const [isPending, startTrans] = useTransition();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%", minHeight: 0 }}>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {STAT_CARDS(counts).map((card) => (
          <div key={card.label} style={{
            background: "#fff",
            border: "1px solid #F1F5F9",
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: card.light,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: card.accent,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {card.label}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabela ────────────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        border: "1px solid #F1F5F9",
        borderRadius: 16,
        flex: 1, minHeight: 0,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}>

        {/* Toolbar */}
        <div style={{
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 10,
          flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8FAFC",
            borderRadius: 10, padding: "8px 12px",
            flex: 1, minWidth: 0,
            border: "1px solid #EEF2F7",
          }}>
            <Search size={13} style={{ color: "#CBD5E1", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: "#0F172A", width: "100%",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", padding: 0, flexShrink: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "#F8FAFC",
            borderRadius: 10, padding: 3,
            border: "1px solid #EEF2F7",
            flexShrink: 0,
          }}>
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: "5px 13px", borderRadius: 8,
                    border: "none",
                    fontSize: 12.5, fontWeight: active ? 600 : 500,
                    background: active ? "#fff" : "transparent",
                    color: active ? "#0F172A" : "#94A3B8",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    whiteSpace: "nowrap",
                  }}
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
            <thead>
              <tr>
                <th style={{ padding: "0 20px 12px", width: 1, borderBottom: "1px solid #F1F5F9" }} />
                <Th label="Empresa"  sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"     sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ padding: "0 20px 12px", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>
                  Contato
                </th>
                <Th label="Status"   sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th style={{ width: 48, borderBottom: "1px solid #F1F5F9" }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 10,
                      padding: "60px 24px",
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: "#F8FAFC",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Building2 size={20} style={{ color: "#CBD5E1" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                          Nenhuma empresa encontrada
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94A3B8" }}>
                          {search || filter !== "ALL" ? "Tente ajustar os filtros." : "Empresas cadastradas aparecerão aqui."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.id}
                    style={{ transition: "background 0.1s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFBFC"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Avatar coluna estreita */}
                    <td style={{ padding: "14px 0 14px 20px", width: 1 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: avatarGradient(c.tradeName ?? c.name),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 13, fontWeight: 800,
                      }}>
                        {(c.tradeName ?? c.name).charAt(0).toUpperCase()}
                      </div>
                    </td>

                    {/* Empresa */}
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#0F172A", lineHeight: 1.3 }}>
                        {c.tradeName ?? c.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
                        {c.name}
                      </p>
                    </td>

                    {/* CNPJ */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 12, color: "#64748B",
                        fontFamily: "monospace",
                        letterSpacing: "0.02em",
                      }}>
                        {formatCNPJ(c.cnpj)}
                      </span>
                    </td>

                    {/* Contato */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#334155" }}>
                          <Mail size={11} style={{ color: "#CBD5E1", flexShrink: 0 }} />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94A3B8" }}>
                            <Phone size={11} style={{ color: "#CBD5E1", flexShrink: 0 }} />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 20px" }}>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Data */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 12.5, color: "#94A3B8", whiteSpace: "nowrap" }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px 14px 0" }}>
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
            borderTop: "1px solid #F8FAFC",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              <strong style={{ color: "#64748B" }}>{rows.length}</strong> de <strong style={{ color: "#64748B" }}>{data.length}</strong> empresa{data.length !== 1 ? "s" : ""}
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
