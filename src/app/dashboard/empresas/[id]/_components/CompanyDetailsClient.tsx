"use client";

import { useState, useTransition } from "react";
import {
  Building2, User, Mail, Phone, MapPin, Calendar, Truck,
  CreditCard, CheckCircle2, Clock, XCircle, AlertTriangle,
  ArrowLeft, Plus, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tenantConfig } from "@/config/tenant";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPayment, markPaymentAsPaid } from "@/app/actions/companies";
import type { CompanyDetails, Payment, PaymentStats } from "@/app/actions/companies";

const { theme: t } = tenantConfig;

const STATUS_CONFIG = {
  ACTIVE:   { label: "Ativa",    color: "#059669", dot: "#10B981", bg: "#ECFDF5" },
  PENDING:  { label: "Pendente", color: "#B45309", dot: "#F59E0B", bg: "#FFFBEB" },
  INACTIVE: { label: "Inativa",  color: "#94A3B8", dot: "#CBD5E1", bg: "#F8FAFC" },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PAGO:      { label: "Pago",      color: "#059669", bg: "#ECFDF5", icon: <CheckCircle2 size={14} /> },
  PENDENTE:  { label: "Pendente",  color: "#B45309", bg: "#FFFBEB", icon: <Clock size={14} /> },
  ATRASADO:  { label: "Atrasado",  color: "#DC2626", bg: "#FEF2F2", icon: <AlertTriangle size={14} /> },
  ESTORNADO: { label: "Estornado", color: "#64748B", bg: "#F8FAFC", icon: <XCircle size={14} /> },
};

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").padEnd(14, "0");
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

type Tab = "info" | "pagamentos";

export function CompanyDetailsClient({
  company, payments: initialPayments, stats: initialStats, isAdmin,
}: {
  company: CompanyDetails;
  payments: Payment[];
  stats: PaymentStats | null;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<Tab>("info");
  const [payments, setPayments] = useState(initialPayments);
  const [stats, setStats] = useState(initialStats);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const router = useRouter();
  const name = company.tradeName ?? company.user.name;

  function handlePaymentCreated(newPayment: Payment) {
    setPayments((prev) => [newPayment, ...prev]);
    setShowNewPayment(false);
    router.refresh();
  }

  function handlePaymentPaid(paymentId: string) {
    setPayments((prev) => prev.map((p) =>
      p.id === paymentId ? { ...p, status: "PAGO", paidAt: new Date().toISOString() } : p
    ));
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {isAdmin && (
          <Link href="/dashboard/empresas" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: "#F1F5F9", color: "#64748B",
          }}>
            <ArrowLeft size={18} />
          </Link>
        )}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0 }}>{name}</h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "2px 0 0" }}>
            {formatCNPJ(company.cnpj)} · {company.user.email}
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusBadge status={company.user.status} config={STATUS_CONFIG} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #F1F5F9" }}>
        {(["info", "pagamentos"] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 20px", fontSize: 13.5, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? "#0C6B64" : "#94A3B8",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: tab === key ? "2px solid #0C6B64" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
              textTransform: "capitalize",
            }}
          >
            {key === "info" ? "Informações" : "Pagamentos"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "info" && <InfoTab company={company} />}
      {tab === "pagamentos" && (
        <PaymentsTab
          companyId={company.id}
          payments={payments}
          stats={stats}
          isAdmin={isAdmin}
          onNewPayment={() => setShowNewPayment(true)}
          onPaymentPaid={handlePaymentPaid}
        />
      )}

      {/* Modal Novo Pagamento */}
      {isAdmin && (
        <NewPaymentModal
          companyId={company.id}
          open={showNewPayment}
          onClose={() => setShowNewPayment(false)}
          onCreated={handlePaymentCreated}
        />
      )}
    </div>
  );
}

// ── Info Tab ──────────────────────────────────────────────────────────────────

function InfoTab({ company }: { company: CompanyDetails }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Building2 size={16} color="#0C6B64" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Dados da Empresa</span>
        </div>
        <InfoRow label="Razão Social" value={company.tradeName ?? "—"} />
        <InfoRow label="CNPJ" value={formatCNPJ(company.cnpj)} />
        <InfoRow icon={<Truck size={14} />} label="Fretes realizados" value={String(company._count.deliveries)} />
        <InfoRow icon={<Calendar size={14} />} label="Cadastro" value={formatDate(company.user.createdAt)} />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <User size={16} color="#0C6B64" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Responsável</span>
        </div>
        <InfoRow label="Nome" value={company.user.name} />
        <InfoRow icon={<Mail size={14} />} label="E-mail" value={company.user.email} />
        <InfoRow icon={<Phone size={14} />} label="Telefone" value={company.user.phone ?? "—"} />
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #F1F5F9", gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <MapPin size={16} color="#0C6B64" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Endereços</span>
        </div>
        {company.addresses.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94A3B8" }}>Nenhum endereço cadastrado.</p>
        ) : (
          company.addresses.map((addr) => (
            <div key={addr.id} style={{
              padding: "12px 16px", borderRadius: 10, background: "#F8FAFC", marginBottom: 8,
              fontSize: 13, color: "#475569", lineHeight: 1.6,
            }}>
              {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""}
              <br />{addr.neighborhood} — {addr.city}/{addr.state} · CEP {addr.cep}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Payments Tab ──────────────────────────────────────────────────────────────

function PaymentsTab({
  companyId, payments, stats, isAdmin, onNewPayment, onPaymentPaid,
}: {
  companyId: string;
  payments: Payment[];
  stats: PaymentStats | null;
  isAdmin: boolean;
  onNewPayment: () => void;
  onPaymentPaid: (id: string) => void;
}) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [isPending, startTrans] = useTransition();

  async function handleMarkPaid(paymentId: string) {
    setPayingId(paymentId);
    startTrans(async () => {
      const res = await markPaymentAsPaid(paymentId, companyId);
      if (res.ok) {
        toast.success("Pagamento marcado como pago!");
        onPaymentPaid(paymentId);
      } else {
        toast.error(res.error ?? "Erro ao atualizar pagamento");
      }
      setPayingId(null);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header com botão */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Histórico de Pagamentos</span>
        {isAdmin && (
          <button
            onClick={onNewPayment}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              background: "#0C6B64", color: "#fff",
              fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            }}
          >
            <Plus size={14} /> Novo Pagamento
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <StatCard label="Total" value={formatMoney(stats.total)} icon={<CreditCard size={15} />} accent="#0C6B64" light="#F0FDFA" />
          <StatCard label="Pago" value={formatMoney(stats.paid)} icon={<CheckCircle2 size={15} />} accent="#059669" light="#ECFDF5" />
          <StatCard label="Pendente" value={formatMoney(stats.pending)} icon={<Clock size={15} />} accent="#B45309" light="#FFFBEB" />
          <StatCard label="Atrasado" value={formatMoney(stats.overdue)} icon={<AlertTriangle size={15} />} accent="#DC2626" light="#FEF2F2" />
        </div>
      )}

      {/* Tabela */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              <th style={TH}>Descrição</th>
              <th style={TH}>Valor</th>
              <th style={TH}>Vencimento</th>
              <th style={TH}>Pagamento</th>
              <th style={TH}>Status</th>
              {isAdmin && <th style={{ ...TH, textAlign: "right" }}>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  Nenhum pagamento registrado.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const ps = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.PENDENTE;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td style={TD}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{p.description ?? "Mensalidade"}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{formatMoney(Number(p.amount))}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ fontSize: 12.5, color: "#64748B" }}>{formatDate(p.dueDate)}</span>
                    </td>
                    <td style={TD}>
                      <span style={{ fontSize: 12.5, color: "#64748B" }}>{p.paidAt ? formatDate(p.paidAt) : "—"}</span>
                    </td>
                    <td style={TD}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20,
                        background: ps.bg, fontSize: 12, fontWeight: 600, color: ps.color,
                      }}>
                        {ps.icon} {ps.label}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ ...TD, textAlign: "right" }}>
                        {(p.status === "PENDENTE" || p.status === "ATRASADO") && (
                          <button
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={payingId === p.id}
                            style={{
                              padding: "5px 12px", borderRadius: 8,
                              background: "#ECFDF5", color: "#059669",
                              fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                              opacity: payingId === p.id ? 0.6 : 1,
                            }}
                          >
                            {payingId === p.id ? "..." : "Marcar como pago"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Modal Novo Pagamento ─────────────────────────────────────────────────────

function NewPaymentModal({
  companyId, open, onClose, onCreated,
}: {
  companyId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (payment: Payment) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("99,90");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit() {
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Valor inválido");
      return;
    }
    if (!dueDate) {
      toast.error("Informe a data de vencimento");
      return;
    }

    setLoading(true);
    const res = await createPayment({
      companyId,
      amount: parsedAmount,
      dueDate,
      description: description || undefined,
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Pagamento criado!");
      onCreated({
        id: "temp-" + Date.now(),
        companyId,
        amount: parsedAmount,
        dueDate,
        paidAt: null,
        status: "PENDENTE",
        description: description || null,
        createdAt: new Date().toISOString(),
      });
      setAmount("99,90");
      setDueDate("");
      setDescription("");
    } else {
      toast.error(res.error ?? "Erro ao criar pagamento");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden" style={{ borderRadius: 16 }}>
        <div style={{ background: "linear-gradient(135deg, #0C6B64, #2EC4B6)", padding: "24px 28px" }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>Novo Pagamento</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "4px 0 0" }}>
            Registre uma nova cobrança para esta empresa
          </p>
        </div>

        <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Valor (R$) *
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="99,90"
              style={INPUT}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Data de vencimento *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={INPUT}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mensalidade Março/2026"
              style={INPUT}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "1px solid #E2E8F0", background: "#fff",
                fontSize: 13.5, fontWeight: 600, color: "#475569", cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", borderRadius: 10,
                border: "none", background: "#0C6B64",
                fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <><Loader2 size={15} style={{ animation: "spin 0.9s linear infinite" }} /> Criando...</> : "Criar pagamento"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #E2E8F0", fontSize: 13.5, color: "#0F172A",
  outline: "none", boxSizing: "border-box", background: "#F8FAFC",
};

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
      {icon && <span style={{ color: "#94A3B8", flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 12, color: "#94A3B8", minWidth: 100 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, icon, accent, light }: {
  label: string; value: string; icon: React.ReactNode; accent: string; light: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #F1F5F9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: light, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{value}</p>
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "#94A3B8",
  textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left",
};

const TD: React.CSSProperties = { padding: "14px 16px" };
