"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  UserCheck, UserX, ChevronUp, ChevronDown,
  ChevronsUpDown, Mail, Phone, X,
  Calendar,
} from "lucide-react";
import { tenantConfig }      from "@/config/tenant";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionsDropdown } from "@/components/dashboard/actions-dropdown";

const { theme: t } = tenantConfig;

// ── Status config ─────────────────────────────────────────────────────────────

const COMPANY_STATUS_CONFIG = {
  ACTIVE:   { label: "Ativa",    color: "#059669", dot: "#10B981", bg: "#ECFDF5" },
  PENDING:  { label: "Pendente", color: "#B45309", dot: "#F59E0B", bg: "#FFFBEB" },
  INACTIVE: { label: "Inativa",  color: "#94A3B8", dot: "#CBD5E1", bg: "#F8FAFC" },
};

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

function CompanyActionsMenu({ company, onUpdate }: {
  company:  CompanyRow;
  onUpdate: (userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") => void;
}) {
  const items =
    company.status === "ACTIVE"
      ? [
          { label: "Marcar como pendente", icon: <Clock    size={13} />, status: "PENDING"  as const, color: "#B45309", hoverBg: "#FFFBEB" },
          { label: "Bloquear empresa",     icon: <UserX    size={13} />, status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" },
        ]
      : company.status === "PENDING"
      ? [
          { label: "Ativar empresa",   icon: <UserCheck size={13} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" },
          { label: "Bloquear empresa", icon: <UserX     size={13} />, status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" },
        ]
      : [
          { label: "Reativar empresa", icon: <UserCheck size={13} />, status: "ACTIVE" as const, color: "#059669", hoverBg: "#ECFDF5" },
        ];

  return (
    <ActionsDropdown
      items={items.map((item) => ({
        ...item,
        onClick: () => onUpdate(company.userId, item.status),
      }))}
    />
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

// ── Mobile Card ───────────────────────────────────────────────────────────────

function CompanyCard({ company, onUpdate }: {
  company:  CompanyRow;
  onUpdate: (userId: string, status: "ACTIVE" | "PENDING" | "INACTIVE") => void;
}) {
  const cfg  = COMPANY_STATUS_CONFIG[company.status as keyof typeof COMPANY_STATUS_CONFIG];
  const name = company.tradeName ?? company.name;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #EEF2F7",
      borderRadius: 16,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      position: "relative",
    }}>
      {/* Card Top: Avatar + Name + Actions Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: avatarGradient(name),
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 16, fontWeight: 800,
          boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700,
            color: "#0F172A", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {company.name}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <CompanyActionsMenu company={company} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F1F5F9", margin: "0 -16px" }} />

      {/* Info Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>

        {/* CNPJ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#CBD5E1",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            CNPJ
          </span>
          <span style={{ fontSize: 12, color: "#334155", fontFamily: "monospace", letterSpacing: "0.02em" }}>
            {formatCNPJ(company.cnpj)}
          </span>
        </div>

        {/* Email */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
            E-mail
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12, color: "#334155",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            <Mail size={11} style={{ color: "#CBD5E1", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {company.email}
            </span>
          </span>
        </div>

        {/* Phone */}
        {company.phone && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#CBD5E1", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
              Telefone
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748B" }}>
              <Phone size={11} style={{ color: "#CBD5E1", flexShrink: 0 }} />
              {company.phone}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer: Status + Date */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 12, borderTop: "1px solid #F1F5F9",
      }}>
        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: cfg.bg,
          borderRadius: 20, padding: "4px 10px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Date */}
        <span style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11.5, color: "#94A3B8",
        }}>
          <Calendar size={11} style={{ flexShrink: 0 }} />
          {formatDate(company.createdAt)}
        </span>
      </div>
    </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STAT_CARDS(counts).map((card) => (
          <div key={card.label} style={{
            background: "#fff",
            border: "1px solid #F1F5F9",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: card.light,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: card.accent,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {card.label}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Panel ─────────────────────────────────────────────────── */}
      <div style={{
        background: "#fff",
        border: "1px solid #F1F5F9",
        borderRadius: 16,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}>

        {/* Toolbar */}
        <div style={{
          padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 8,
          flexShrink: 0,
        }}>
          {/* Search — full width */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8FAFC",
            borderRadius: 10, padding: "8px 12px",
            width: "100%",
            border: "1px solid #EEF2F7",
            boxSizing: "border-box",
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

          {/* Filter tabs — row below */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "#F8FAFC",
            borderRadius: 10, padding: 3,
            border: "1px solid #EEF2F7",
            overflowX: "auto",
            width: "100%",
            boxSizing: "border-box",
          }}>
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  style={{
                    flex: 1,
                    padding: "6px 8px", borderRadius: 8,
                    border: "none",
                    fontSize: 12, fontWeight: active ? 600 : 500,
                    background: active ? "#fff" : "transparent",
                    color: active ? "#0F172A" : "#94A3B8",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mobile Cards (hidden on sm+) ─────────────────────────── */}
        <div className="block sm:hidden">
          {rows.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 10,
              padding: "50px 24px",
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 12px 12px" }}>
              {rows.map((c) => (
                <CompanyCard key={c.id} company={c} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </div>

        {/* ── Desktop Table (hidden below sm) ─────────────────────── */}
        <div className="hidden sm:block overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
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
                    style={{ borderBottom: "1px solid #F8FAFC", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Avatar */}
                    <td style={{ padding: "14px 20px 14px 20px", width: 1 }}>
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
                      <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace", letterSpacing: "0.02em" }}>
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
                      <StatusBadge status={c.status} config={COMPANY_STATUS_CONFIG} />
                    </td>

                    {/* Data */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 12.5, color: "#94A3B8", whiteSpace: "nowrap" }}>
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px 14px 0" }}>
                      <CompanyActionsMenu company={c} onUpdate={handleUpdate} />
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
            padding: "10px 16px",
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
