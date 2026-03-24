"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2, TrendingUp, Settings, Wallet, UserCircle,
  ClipboardList, BarChart3, Bell,
  Truck, MapPin, Navigation, PackageSearch,
} from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const { theme: t, shortName } = tenantConfig;

type Role = "ADMIN" | "COMPANY" | "DRIVER";

export function LoadingClient({ role, profileComplete, accessDenied, denyReason }: {
  role: Role;
  profileComplete: boolean;
  accessDenied: boolean;
  denyReason: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem("showWelcome", "1");
      if (role === "COMPANY" && accessDenied) {
        // Acesso negado — força logout com motivo
        router.push(`/?error=${denyReason.toLowerCase()}`);
      } else if (role === "COMPANY" && !profileComplete) {
        router.push("/dashboard/onboarding");
      } else {
        router.push("/dashboard");
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [router, role, profileComplete, accessDenied, denyReason]);

  if (role === "ADMIN")  return <AdminLoading />;
  if (role === "DRIVER") return <DriverLoading />;
  return <CompanyLoading />;
}

// ── ADMIN — framer-motion ─────────────────────────────────────────────────────

const ADMIN_ICONS = [
  { Icon: Building2,  angle: 0   },
  { Icon: UserCircle, angle: 72  },
  { Icon: TrendingUp, angle: 144 },
  { Icon: Wallet,     angle: 216 },
  { Icon: Settings,   angle: 288 },
];

function AdminLoading() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: t.gradientPrimary,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>

      {/* Anéis pulsantes */}
      {[180, 320, 460].map((size, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: size, height: size,
            borderRadius: "50%",
            border: `1.5px solid rgba(255,255,255,${0.18 - i * 0.05})`,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 0.3, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
        />
      ))}

      {/* Ícones orbitando */}
      {ADMIN_ICONS.map(({ Icon, angle }, i) => {
        const rad = (angle * Math.PI) / 180;
        const r   = 130;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: 42, height: 42,
              borderRadius: 13,
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.32)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              left: `calc(50% + ${Math.cos(rad) * r}px - 21px)`,
              top:  `calc(50% + ${Math.sin(rad) * r}px - 21px)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1, scale: 1,
              y: [0, -7, 0],
            }}
            transition={{
              opacity: { delay: 0.3 + i * 0.1, duration: 0.4 },
              scale:   { delay: 0.3 + i * 0.1, duration: 0.4, type: "spring", bounce: 0.5 },
              y:       { delay: 0.9 + i * 0.1, duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Icon style={{ width: 18, height: 18, color: "#fff" }} />
          </motion.div>
        );
      })}

      {/* Logo central */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, type: "spring", bounce: 0.45 }}
        style={{
          width: 84, height: 84, borderRadius: 26,
          background: "rgba(255,255,255,0.22)",
          border: "1.5px solid rgba(255,255,255,0.4)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 900, color: "#fff",
          letterSpacing: "-1px",
          marginBottom: 28,
        }}
      >
        {shortName}
      </motion.div>

      {/* Textos */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.5 }}
        style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}
      >
        Painel Administrativo
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.72, duration: 0.5 }}
        style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, marginTop: 6, fontWeight: 500 }}
      >
        Preparando sua área de gestão…
      </motion.p>

      {/* Dots */}
      <motion.div
        style={{ display: "flex", gap: 8, position: "absolute", bottom: 56 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: 8, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.85)" }}
            animate={{ scale: [1, 1.45, 1], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.28, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ── COMPANY — spinner padrão + ícones de negócio ─────────────────────────────

const COMPANY_ICONS = [
  { Icon: Building2,    label: "Empresa",    color: "#8B5CF6" },
  { Icon: Wallet,       label: "Financeiro", color: t.success  },
  { Icon: ClipboardList,label: "Fretes",     color: t.primary  },
  { Icon: BarChart3,    label: "Relatórios", color: "#F59E0B"  },
  { Icon: Bell,         label: "Alertas",    color: "#6366F1"  },
];

function CompanyLoading() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: t.background,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 36,
    }}>

      {/* Spinner */}
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <motion.div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            border: `4px solid ${t.border}`,
            borderTopColor: t.primary,
            position: "absolute", inset: 0,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
        />
        {/* Anel interno */}
        <motion.div
          style={{
            width: 52, height: 52, borderRadius: "50%",
            border: `3px solid ${t.border}`,
            borderTopColor: "#8B5CF6",
            position: "absolute",
            top: 14, left: 14,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
        />
        <div style={{
          position: "absolute",
          inset: 22,
          borderRadius: "50%",
          background: t.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Building2 style={{ width: 16, height: 16, color: t.primary }} />
        </div>
      </div>

      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ textAlign: "center" }}
      >
        <p style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, margin: 0 }}>
          Carregando sua empresa
        </p>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 5, fontWeight: 400 }}>
          Preparando o painel de controle…
        </p>
      </motion.div>

      {/* Ícones de negócio */}
      <div style={{ display: "flex", gap: 14 }}>
        {COMPANY_ICONS.map(({ Icon, label, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 22, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18 + i * 0.12, duration: 0.38, type: "spring", bounce: 0.35 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
          >
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: `${color}14`,
              border: `1.5px solid ${color}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon style={{ width: 20, height: 20, color }} />
            </div>
            <span style={{ fontSize: 10.5, color: t.textSecondary, fontWeight: 600 }}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── DRIVER — spinner + ícones de rota ────────────────────────────────────────

const DRIVER_ICONS = [
  { Icon: PackageSearch, label: "Disponíveis", color: "#F59E0B" },
  { Icon: Truck,         label: "Fretes",      color: t.primary  },
  { Icon: MapPin,        label: "Rotas",       color: "#EF4444"  },
  { Icon: Navigation,    label: "Rastrear",    color: t.success  },
  { Icon: Wallet,        label: "Saldo",       color: "#6366F1"  },
];

function DriverLoading() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: t.background,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 36,
    }}>

      {/* Spinner */}
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <motion.div
          style={{
            width: 80, height: 80, borderRadius: "50%",
            border: `4px solid ${t.border}`,
            borderTopColor: "#F59E0B",
            position: "absolute", inset: 0,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          style={{
            width: 52, height: 52, borderRadius: "50%",
            border: `3px solid ${t.border}`,
            borderTopColor: t.primary,
            position: "absolute",
            top: 14, left: 14,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
        />
        <div style={{
          position: "absolute",
          inset: 22,
          borderRadius: "50%",
          background: "#FFF8E7",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Truck style={{ width: 16, height: 16, color: "#F59E0B" }} />
        </div>
      </div>

      {/* Texto */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ textAlign: "center" }}
      >
        <p style={{ fontSize: 19, fontWeight: 700, color: t.textPrimary, margin: 0 }}>
          Carregando sua operação
        </p>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 5, fontWeight: 400 }}>
          Verificando fretes disponíveis…
        </p>
      </motion.div>

      {/* Ícones de rota */}
      <div style={{ display: "flex", gap: 14 }}>
        {DRIVER_ICONS.map(({ Icon, label, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 22, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18 + i * 0.12, duration: 0.38, type: "spring", bounce: 0.35 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
          >
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: `${color}14`,
              border: `1.5px solid ${color}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon style={{ width: 20, height: 20, color }} />
            </div>
            <span style={{ fontSize: 10.5, color: t.textSecondary, fontWeight: 600 }}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
