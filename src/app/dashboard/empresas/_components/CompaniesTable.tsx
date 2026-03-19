"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search, Building2, CheckCircle2, Clock, XCircle,
  MoreHorizontal, UserCheck, UserX, ChevronUp, ChevronDown,
  ChevronsUpDown, SlidersHorizontal, Mail, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCompanyStatus, type CompanyRow } from "@/app/actions/companies";

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
    <span
      className="inline-flex items-center gap-[5px] px-[10px] py-1 rounded-full text-[12px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      />
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
    ? { label: "Ativar empresa",    icon: <UserCheck className="w-[13px] h-[13px]" />, status: "ACTIVE"   as const, colorClass: "text-[#059669]", hoverBgClass: "hover:bg-[#ECFDF5]" }
    : company.status === "ACTIVE"
    ? { label: "Desativar empresa", icon: <UserX     className="w-[13px] h-[13px]" />, status: "INACTIVE" as const, colorClass: "text-[#DC2626]", hoverBgClass: "hover:bg-[#FEF2F2]" }
    : { label: "Reativar empresa",  icon: <UserCheck className="w-[13px] h-[13px]" />, status: "ACTIVE"   as const, colorClass: "text-[#059669]", hoverBgClass: "hover:bg-[#ECFDF5]" };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-8 h-8 rounded-lg border-[1.5px] border-border cursor-pointer flex items-center justify-center transition-all duration-150",
          open
            ? "bg-background text-primary border-primary"
            : "bg-transparent text-muted-foreground hover:bg-background hover:text-primary hover:border-primary"
        )}
      >
        <MoreHorizontal className="w-[15px] h-[15px]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-border rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)] z-20 min-w-[190px] overflow-hidden p-1">
            <button
              type="button"
              onClick={() => { onUpdate(company.userId, action.status); setOpen(false); }}
              className={cn(
                "flex items-center gap-[9px] w-full px-3 py-[9px] border-none bg-transparent text-[13px] font-semibold cursor-pointer rounded-lg transition-colors duration-150",
                action.colorClass,
                action.hoverBgClass
              )}
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
      className={cn(
        "px-5 py-3 text-[11px] font-bold uppercase tracking-[0.07em] cursor-pointer select-none whitespace-nowrap text-left",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon className="w-3 h-3" />
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
    <div className="flex flex-col gap-4 h-full min-h-0">

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          {
            label: "Total", value: counts.total,
            icon: <Building2 className="w-4 h-4" />,
            iconBg: "bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)]",
            cardBg: "bg-white border-border",
            valueFgClass: "text-foreground",
          },
          {
            label: "Ativas", value: counts.active,
            icon: <CheckCircle2 className="w-4 h-4" />,
            iconBg: "bg-[#059669]",
            cardBg: "bg-[#ECFDF5] border-[#A7F3D0]",
            valueFgClass: "text-[#059669]",
          },
          {
            label: "Pendentes", value: counts.pending,
            icon: <Clock className="w-4 h-4" />,
            iconBg: "bg-[#D97706]",
            cardBg: "bg-[#FFFBEB] border-[#FDE68A]",
            valueFgClass: "text-[#D97706]",
          },
          {
            label: "Inativas", value: counts.inactive,
            icon: <XCircle className="w-4 h-4" />,
            iconBg: "bg-[#94A3B8]",
            cardBg: "bg-[#F8FAFC] border-border",
            valueFgClass: "text-muted-foreground",
          },
        ].map((card) => (
          <div key={card.label} className={cn("border rounded-2xl p-[18px_20px] flex items-center gap-[14px]", card.cardBg)}>
            <div className={cn("w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]", card.iconBg)}>
              {card.icon}
            </div>
            <div>
              <p className="m-0 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em]">
                {card.label}
              </p>
              <p className={cn("mt-0.5 text-[26px] font-extrabold leading-none", card.valueFgClass)}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabela ── */}
      <div className={cn(
        "bg-white border border-border rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden transition-opacity duration-200",
        isPending ? "opacity-65" : "opacity-100"
      )}>

        {/* Toolbar */}
        <div className="px-5 py-[14px] border-b border-border flex items-center gap-3 shrink-0 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-[9px] bg-background rounded-[10px] px-[14px] py-2 flex-1 min-w-[220px] border-[1.5px] border-border">
            <Search className="w-[14px] h-[14px] text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-[13px] text-foreground w-full"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-border shrink-0" />

          {/* Filter pills */}
          <div className="flex items-center gap-0.5">
            <SlidersHorizontal className="w-[13px] h-[13px] text-muted-foreground mr-[6px] shrink-0" />
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "px-[13px] py-1.5 rounded-lg border-[1.5px] text-[12.5px] cursor-pointer transition-all duration-150",
                    active
                      ? "border-primary bg-primary/[0.07] text-primary font-bold"
                      : "border-transparent bg-transparent text-muted-foreground font-medium hover:text-foreground hover:bg-background"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-[1]">
              <tr className="bg-background border-b border-border">
                <Th label="Empresa"  sortKey="name"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="CNPJ"     sortKey="cnpj"      current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] text-left">
                  Contato
                </th>
                <Th label="Status"   sortKey="status"    current={sortKey} dir={sortDir} onSort={handleSort} />
                <Th label="Cadastro" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="w-14" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center gap-3 py-16 px-6">
                      <div className="w-14 h-14 rounded-[18px] bg-background flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#CBD5E1]" />
                      </div>
                      <div className="text-center">
                        <p className="m-0 text-[14px] font-bold text-foreground">
                          Nenhuma empresa encontrada
                        </p>
                        <p className="mt-[5px] text-[13px] text-muted-foreground">
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
                    className={cn(
                      "transition-colors duration-[120ms] cursor-default hover:bg-primary/[0.02]",
                      i < rows.length - 1 ? "border-b border-border" : ""
                    )}
                  >
                    {/* Empresa */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-[38px] h-[38px] rounded-[11px] shrink-0 flex items-center justify-center text-white text-[14px] font-extrabold shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                          style={{ background: avatarColor(c.tradeName ?? c.name) }}
                        >
                          {(c.tradeName ?? c.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="m-0 text-[13.5px] font-bold text-foreground leading-[1.3]">
                            {c.tradeName ?? c.name}
                          </p>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">
                            {c.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CNPJ */}
                    <td className="px-5 py-4">
                      <span className="text-[12.5px] text-muted-foreground font-[family-name:var(--font-geist-mono)] bg-background px-2 py-[3px] rounded-md border border-border">
                        {formatCNPJ(c.cnpj)}
                      </span>
                    </td>

                    {/* Contato */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-[3px]">
                        <span className="flex items-center gap-[5px] text-[12.5px] text-foreground">
                          <Mail className="w-[11px] h-[11px] text-muted-foreground shrink-0" />
                          {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-[5px] text-[12px] text-muted-foreground">
                            <Phone className="w-[11px] h-[11px] text-muted-foreground shrink-0" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Data */}
                    <td className="px-5 py-4">
                      <span className="text-[12.5px] text-muted-foreground whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
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
          <div className="px-5 py-[10px] border-t border-border flex items-center justify-between shrink-0">
            <span className="text-[12px] text-muted-foreground">
              Exibindo <strong className="text-foreground">{rows.length}</strong> de <strong className="text-foreground">{data.length}</strong> empresa{data.length !== 1 ? "s" : ""}
            </span>
            {filter !== "ALL" || search ? (
              <button
                type="button"
                onClick={() => { setFilter("ALL"); setSearch(""); }}
                className="text-[12px] text-primary bg-transparent border-none cursor-pointer font-semibold p-0"
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
