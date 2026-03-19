"use client";

import { useState } from "react";
import {
  Search, UserCheck, UserX, Trash2,
  Mail, Phone, Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { updateDriverStatus, deleteDriver, type DriverRow } from "@/app/actions/drivers";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionsDropdown } from "@/components/dashboard/actions-dropdown";

type Props = {
  initialData: DriverRow[];
  userRole?: string;
};

const DRIVER_STATUS_CONFIG = {
  ACTIVE:   { label: "Ativo",    color: "#059669", dot: "#10B981", bg: "#ECFDF5" },
  PENDING:  { label: "Pendente", color: "#B45309", dot: "#F59E0B", bg: "#FFFBEB" },
  INACTIVE: { label: "Inativo",  color: "#94A3B8", dot: "#CBD5E1", bg: "#F8FAFC" },
};

function OnlineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      background: isOnline ? "#DCFCE7" : "#F1F5F9",
      fontSize: 11, fontWeight: 600,
      color: isOnline ? "#16A34A" : "#64748B",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isOnline ? "#16A34A" : "#94A3B8" }} />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function AutonomoBadge({ autonomo }: { autonomo: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      background: autonomo ? "#DBEAFE" : "#FEF3C7",
      fontSize: 11, fontWeight: 600,
      color: autonomo ? "#1D4ED8" : "#B45309",
    }}>
      <Briefcase size={10} />
      {autonomo ? "Autônomo" : "Empresa"}
    </span>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function avatarGradient(name: string) {
  const palettes = [
    ["#8B5CF6","#A78BFA"], ["#0C6B64","#2EC4B6"],
    ["#7C3AED","#A78BFA"], ["#1D4ED8","#60A5FA"],
  ];
  return `linear-gradient(135deg, ${palettes[name.charCodeAt(0) % palettes.length][0]}, ${palettes[name.charCodeAt(0) % palettes.length][1]})`;
}

function DriverActions({ driver, onUpdate }: {
  driver:   DriverRow;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const statusItems =
    driver.status === "ACTIVE"
      ? [{ label: "Bloquear", icon: <UserX size={13} />, status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" }]
      : driver.status === "PENDING"
      ? [
          { label: "Ativar",   icon: <UserCheck size={13} />, status: "ACTIVE"   as const, color: "#059669", hoverBg: "#ECFDF5" },
          { label: "Bloquear", icon: <UserX     size={13} />, status: "INACTIVE" as const, color: "#DC2626", hoverBg: "#FEF2F2" },
        ]
      : [{ label: "Ativar", icon: <UserCheck size={13} />, status: "ACTIVE" as const, color: "#059669", hoverBg: "#ECFDF5" }];

  async function handleAction(status: string) {
    setLoading(true);
    const res = await updateDriverStatus(driver.userId, status);
    setLoading(false);
    if (res.ok) {
      toast.success(`Motorista ${status === "ACTIVE" ? "ativado" : "bloqueado"}`);
      onUpdate();
    } else {
      toast.error(res.error ?? "Erro ao atualizar");
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este motorista?")) return;
    setLoading(true);
    const res = await deleteDriver(driver.userId);
    setLoading(false);
    if (res.ok) {
      toast.success("Motorista excluído");
      onUpdate();
    } else {
      toast.error(res.error ?? "Erro ao excluir");
    }
  }

  return (
    <ActionsDropdown
      loading={loading}
      items={statusItems.map((item) => ({
        ...item,
        onClick: () => handleAction(item.status),
      }))}
      dangerItem={{
        label:   "Excluir",
        icon:    <Trash2 size={13} />,
        onClick: handleDelete,
      }}
    />
  );
}

export function DriversTable({ initialData, userRole }: Props) {
  const [drivers] = useState(initialData);
  const [search, setSearch] = useState("");

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.cpf.includes(search)
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff", borderRadius: 12, padding: "10px 16px",
        border: "1px solid #E2E8F0", marginBottom: 16,
      }}>
        <Search size={18} style={{ color: "#94A3B8" }} />
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: 14, color: "#1E293B",
          }}
        />
      </div>

      {/* Table header */}
      <div style={{
        display: "grid", 
        gridTemplateColumns: userRole === "ADMIN" 
          ? "1.5fr 1.2fr 100px 100px 100px 100px 80px"
          : "1.5fr 1.2fr 100px 100px 100px 80px",
        gap: 16, padding: "12px 20px",
        background: "#F8FAFC", borderRadius: "10px 10px 0 0",
        border: "1px solid #E2E8F0", borderBottom: "none",
        fontSize: 11, fontWeight: 700, color: "#64748B",
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        <span>Motorista</span>
        <span>Contato</span>
        <span>Status</span>
        <span>Online</span>
        {userRole === "ADMIN" && <span>Tipo</span>}
        <span>Entregas</span>
        <span></span>
      </div>

      {/* Table body */}
      <div style={{
        flex: 1, overflowY: "auto",
        background: "#fff", borderRadius: "0 0 12px 12px",
        border: "1px solid #E2E8F0", borderTop: "none",
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "#64748B", fontSize: 14 }}>Nenhum motorista encontrado</p>
          </div>
        ) : (
          filtered.map((driver) => (
            <div key={driver.id} style={{
              display: "grid", 
              gridTemplateColumns: userRole === "ADMIN"
                ? "1.5fr 1.2fr 100px 100px 100px 100px 80px"
                : "1.5fr 1.2fr 100px 100px 100px 80px",
              gap: 16, padding: "14px 20px",
              borderBottom: "1px solid #F1F5F9",
              alignItems: "center",
            }}>
              {/* Nome + CPF */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: avatarGradient(driver.name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}>
                  {driver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: 0 }}>{driver.name}</p>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>{driver.cpf}</p>
                </div>
              </div>

              {/* Contato */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
                  <Mail size={12} />
                  <span>{driver.email}</span>
                </div>
                {driver.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
                    <Phone size={12} />
                    <span>{driver.phone}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <StatusBadge status={driver.status} config={DRIVER_STATUS_CONFIG} />

              {/* Online */}
              <OnlineBadge isOnline={driver.isOnline} />

              {/* Tipo - só mostra para ADMIN */}
              {userRole === "ADMIN" && (
                <AutonomoBadge autonomo={driver.autonomo} />
              )}

              {/* Entregas */}
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                {driver.totalDeliveries}
              </span>

              {/* Actions */}
              <DriverActions driver={driver} onUpdate={() => window.location.reload()} />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 0 0", fontSize: 12, color: "#94A3B8" }}>
        Total: {filtered.length} motorista{filtered.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}