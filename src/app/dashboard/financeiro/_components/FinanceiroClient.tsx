"use client";

import { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import {
  QrCode, Copy, Check, X, CheckCircle2,
  Clock, AlertCircle, CreditCard, TrendingUp,
  Calendar,
} from "lucide-react";
import type { Payment, PaymentStats } from "@/app/actions/payments";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/** Gera código PIX simulado determinístico baseado no ID do pagamento */
function generatePixCode(paymentId: string, amount: number): string {
  const key = "frete-facil@pix.com.br";
  const amountStr = amount.toFixed(2);
  const shortId   = paymentId.slice(-8).toUpperCase();
  return (
    `00020126360014BR.GOV.BCB.PIX0114+5511999999999` +
    `520400005303986` +
    `54${String(amountStr.length).padStart(2, "0")}${amountStr}` +
    `5802BR` +
    `5913FRETE FACIL` +
    `6009SAO PAULO` +
    `62140510${shortId}` +
    `6304${checksum(key + shortId)}`
  );
}

function checksum(str: string): string {
  let n = 0;
  for (let i = 0; i < str.length; i++) n = (n + str.charCodeAt(i)) % 9999;
  return n.toString(16).toUpperCase().padStart(4, "0");
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS: Record<Payment["status"], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PAGO:     { label: "Pago",     color: "#10B981", bg: "#ECFDF5", icon: <CheckCircle2 size={13} /> },
  PENDENTE: { label: "Pendente", color: "#F59E0B", bg: "#FFFBEB", icon: <Clock        size={13} /> },
  ATRASADO: { label: "Atrasado", color: "#EF4444", bg: "#FEF2F2", icon: <AlertCircle  size={13} /> },
};

// ─── Badge de status ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Payment["status"] }) {
  const s = STATUS[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
    }}>
      {s.icon}
      {s.label}
    </span>
  );
}

// ─── Modal de QR Code ─────────────────────────────────────────────────────────

function QrModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const pixCode = generatePixCode(payment.id, payment.amount);

  function handleCopy() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const status = STATUS[payment.status];
  const isPaid = payment.status === "PAGO";

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(15,23,42,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
        animation: "fadeIn .18s ease",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 380,
          background: "#fff", borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          animation: "scaleIn .2s cubic-bezier(.34,1.4,.64,1)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px 16px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
              Pagar via PIX
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              {payment.description ?? fmtDate(payment.dueDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 9, border: "none",
              background: "#F1F5F9", cursor: "pointer", color: "#64748B",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Valor */}
        <div style={{
          padding: "14px 20px",
          background: "linear-gradient(135deg,#E6FAF8,#f0fdfc)",
          borderBottom: "1px solid #E2F8F6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Valor
            </p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0C6B64" }}>
              {fmt(payment.amount)}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <StatusBadge status={payment.status} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>
              Vence {fmtDate(payment.dueDate)}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div style={{ padding: "22px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {isPaid ? (
            /* Pago — sem QR code */
            <div style={{
              width: 180, height: 180, borderRadius: 16,
              background: "#ECFDF5", border: "2px solid #10B981",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <CheckCircle2 size={48} color="#10B981" />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                Pagamento confirmado
              </p>
            </div>
          ) : (
            <div style={{
              padding: 14, borderRadius: 14,
              background: "#fff",
              border: "1.5px solid #E2E8F0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <QRCode
                value={pixCode}
                size={168}
                bgColor="#ffffff"
                fgColor="#0F172A"
                level="M"
              />
            </div>
          )}

          <p style={{
            margin: 0, fontSize: 12, color: "#94A3B8",
            textAlign: "center", lineHeight: 1.5,
          }}>
            {isPaid
              ? `Pago em ${payment.paidAt ? fmtDate(payment.paidAt) : "—"}`
              : "Abra o app do seu banco e escaneie o código"}
          </p>

          {/* Código copiável */}
          {!isPaid && (
            <>
              <div style={{
                width: "100%", padding: "10px 12px",
                borderRadius: 10, background: "#F8FAFC",
                border: "1px solid #E8ECF0",
                fontSize: 11, fontFamily: "monospace",
                color: "#475569", wordBreak: "break-all",
                lineHeight: 1.5,
                maxHeight: 60, overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}>
                {pixCode.slice(0, 72)}…
              </div>

              <button
                onClick={handleCopy}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: 11, border: "none",
                  background: copied
                    ? "linear-gradient(135deg,#059669,#10B981)"
                    : "linear-gradient(135deg,#0C6B64,#2EC4B6)",
                  color: "#fff", fontSize: 13.5, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "background .25s",
                  boxShadow: "0 4px 12px rgba(46,196,182,0.3)",
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Código copiado!" : "Copiar código PIX"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, bg }: {
  label: string; value: string;
  icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #F1F5F9",
      padding: "16px 18px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: bg, color, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Botão QR ─────────────────────────────────────────────────────────────────

function QrButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Ver QR Code / PIX"
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: "1.5px solid #E2E8F0", background: "#fff",
        cursor: "pointer", color: "#475569",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#E6FAF8";
        e.currentTarget.style.borderColor = "#2EC4B6";
        e.currentTarget.style.color = "#0C6B64";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.color = "#475569";
      }}
    >
      <QrCode size={15} />
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type FilterStatus = "ALL" | Payment["status"];

export function FinanceiroClient({
  initialPayments,
  initialStats,
}: {
  initialPayments: Payment[];
  initialStats:    PaymentStats;
}) {
  const [activeQr,     setActiveQr]     = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  const openQr  = useCallback((p: Payment) => setActiveQr(p),   []);
  const closeQr = useCallback(()           => setActiveQr(null), []);

  const filtered = filterStatus === "ALL"
    ? initialPayments
    : initialPayments.filter((p) => p.status === filterStatus);

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from{opacity:0}                              to{opacity:1} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.94)}         to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(6px)}    to{opacity:1;transform:translateY(0)} }

        /* Tabela visível em telas grandes, cards em telas pequenas */
        .fin-table  { display: table;  }
        .fin-cards  { display: none;   }
        @media (max-width: 700px) {
          .fin-table { display: none;  }
          .fin-cards { display: flex;  flex-direction: column; gap: 10px; }
        }

        /* Stats grid responsivo */
        .fin-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) { .fin-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .fin-stats { grid-template-columns: 1fr 1fr; gap: 8px; } }

        .qr-tr:hover td { background: #FAFBFC !important; }
        .filter-btn { transition: all .15s; }
        .filter-btn:hover { border-color: #2EC4B6 !important; color: #0C6B64 !important; }
      `}</style>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="fin-stats">
        <StatCard
          label="Total pago"
          value={fmt(initialStats.paid)}
          icon={<TrendingUp size={18} />}
          color="#10B981" bg="#ECFDF5"
        />
        <StatCard
          label="Pendente"
          value={fmt(initialStats.pending)}
          icon={<Clock size={18} />}
          color="#F59E0B" bg="#FFFBEB"
        />
        <StatCard
          label="Atrasado"
          value={fmt(initialStats.overdue)}
          icon={<AlertCircle size={18} />}
          color="#EF4444" bg="#FEF2F2"
        />
        <StatCard
          label="Mensalidades"
          value={String(initialStats.count)}
          icon={<CreditCard size={18} />}
          color="#6366F1" bg="#EEF2FF"
        />
      </div>

      {/* ── Painel principal ──────────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid #E8ECF0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
              Mensalidades
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
              {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["ALL", "PENDENTE", "PAGO", "ATRASADO"] as FilterStatus[]).map((s) => {
              const active = filterStatus === s;
              const cfg = s === "ALL" ? null : STATUS[s as Payment["status"]];
              return (
                <button
                  key={s}
                  className="filter-btn"
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, border: "1.5px solid",
                    borderColor: active ? (cfg?.color ?? "#0C6B64") : "#E2E8F0",
                    background: active ? (cfg?.bg ?? "#E6FAF8") : "#fff",
                    color: active ? (cfg?.color ?? "#0C6B64") : "#64748B",
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  {cfg?.icon}
                  {s === "ALL" ? "Todos" : cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TABELA (desktop) ─────────────────────────────────────────── */}
        <table className="fin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              {["Descrição", "Vencimento", "Pagamento", "Valor", "Status", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: h === "Valor" ? "right" : "left",
                    fontSize: 11, fontWeight: 700,
                    color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em",
                    background: "#FAFBFC",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center" }}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="qr-tr"
                  style={{ borderBottom: "1px solid #F8FAFC" }}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg,#E6FAF8,#d0f4f0)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Calendar size={15} color="#0C6B64" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#0F172A" }}>
                          {p.description ?? "Mensalidade"}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>
                          #{p.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 13, color: "#475569" }}>
                      {fmtDate(p.dueDate)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 13, color: p.paidAt ? "#475569" : "#CBD5E1" }}>
                      {p.paidAt ? fmtDate(p.paidAt) : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      {fmt(p.amount)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: "14px 20px 14px 8px", textAlign: "right" }}>
                    <QrButton onClick={() => openQr(p)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── CARDS (mobile) ───────────────────────────────────────────── */}
        <div className="fin-cards" style={{ padding: "12px 14px 14px" }}>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#FAFBFC", borderRadius: 12,
                  border: "1.5px solid #F1F5F9",
                  padding: "14px 15px",
                  animation: "fadeUp .2s ease",
                }}
              >
                {/* Linha superior */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg,#E6FAF8,#d0f4f0)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Calendar size={16} color="#0C6B64" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>
                        {p.description ?? "Mensalidade"}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                        #{p.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge status={p.status} />
                    <QrButton onClick={() => openQr(p)} />
                  </div>
                </div>

                {/* Linha inferior — dados */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 4, paddingTop: 10, borderTop: "1px solid #F1F5F9",
                }}>
                  <InfoCell label="Valor"       value={fmt(p.amount)} strong />
                  <InfoCell label="Vencimento"  value={fmtDate(p.dueDate)} />
                  <InfoCell label="Pago em"     value={p.paidAt ? fmtDate(p.paidAt) : "—"} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal QR Code ─────────────────────────────────────────────── */}
      {activeQr && <QrModal payment={activeQr} onClose={closeQr} />}
    </>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InfoCell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: strong ? 800 : 500, color: strong ? "#0F172A" : "#475569" }}>
        {value}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10, padding: "32px 0",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "#F8FAFC", border: "1.5px solid #F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CreditCard size={20} color="#CBD5E1" />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#94A3B8" }}>
          Nenhum registro encontrado
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: "#CBD5E1", marginTop: 3 }}>
          Nenhuma mensalidade para este filtro
        </p>
      </div>
    </div>
  );
}

