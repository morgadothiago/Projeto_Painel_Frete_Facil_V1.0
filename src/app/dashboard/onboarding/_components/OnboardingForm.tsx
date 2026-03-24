"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Check, Building2 } from "lucide-react";
import { toast } from "sonner";
import { completeCompanyProfile } from "@/app/actions/companies";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

const INITIAL = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

export function OnboardingForm({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setData((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  async function handleCEPBlur() {
    const cep = data.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await res.json();
      if (!d.erro) {
        set("street", d.logradouro || "");
        set("neighborhood", d.bairro || "");
        set("city", d.localidade || "");
        set("state", d.uf || "");
      }
    } catch { /* ignore */ }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!data.zipCode.replace(/\D/g, "").match(/^\d{8}$/)) errs.zipCode = "CEP inválido";
    if (!data.street.trim()) errs.street = "Obrigatório";
    if (!data.number.trim()) errs.number = "Obrigatório";
    if (!data.neighborhood.trim()) errs.neighborhood = "Obrigatório";
    if (!data.city.trim()) errs.city = "Obrigatório";
    if (!data.state.trim()) errs.state = "Obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const res = await completeCompanyProfile({
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Cadastro concluído com sucesso!");
      router.push("/dashboard");
    } else {
      toast.error(res.error ?? "Erro ao salvar dados");
    }
  }

  // Tela de sucesso
  if (step === 1) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#FAFAFA", padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 440, background: "#fff", borderRadius: 20,
          padding: "48px 36px", textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#ECFDF5", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <Check size={32} color="#059669" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>
            Cadastro concluído!
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>
            Seu endereço foi salvo com sucesso. Você já pode usar a plataforma.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              width: "100%", padding: "13px", borderRadius: 12,
              background: "linear-gradient(135deg, #0C6B64, #2EC4B6)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              border: "none", cursor: "pointer",
            }}
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Formulário
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FAFAFA", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0C6B64, #2EC4B6)", padding: "32px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Building2 size={22} color="#fff" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
              Bem-vindo ao FreteFácil
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
            Complete seu cadastro
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Precisamos do endereço da sua empresa para liberar o acesso.
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 36px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <MapPin size={16} color="#0C6B64" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Endereço da empresa</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="CEP *" value={data.zipCode} onChange={(v) => set("zipCode", maskCEP(v))} onBlur={handleCEPBlur} placeholder="00000-000" error={errors.zipCode} />
              <Field label="Estado *" value={data.state} onChange={(v) => set("state", v)} placeholder="SP" error={errors.state} />
            </div>
            <Field label="Cidade *" value={data.city} onChange={(v) => set("city", v)} placeholder="São Paulo" error={errors.city} />
            <Field label="Bairro *" value={data.neighborhood} onChange={(v) => set("neighborhood", v)} placeholder="Centro" error={errors.neighborhood} />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <Field label="Rua *" value={data.street} onChange={(v) => set("street", v)} placeholder="Rua das Flores" error={errors.street} />
              <Field label="Número *" value={data.number} onChange={(v) => set("number", v)} placeholder="123" error={errors.number} />
            </div>
            <Field label="Complemento" value={data.complement} onChange={(v) => set("complement", v)} placeholder="Apto 4, Sala 2..." />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", padding: "13px", marginTop: 24, borderRadius: 12,
              background: loading ? "#ccc" : "linear-gradient(135deg, #0C6B64, #2EC4B6)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <><Loader2 size={16} style={{ animation: "spin 0.9s linear infinite" }} /> Salvando...</>
            ) : "Concluir cadastro"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, error, type = "text", onBlur,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; type?: string; onBlur?: () => void;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: `1.5px solid ${error ? "#DC2626" : "#E2E8F0"}`,
          fontSize: 13.5, color: "#0F172A", outline: "none",
          boxSizing: "border-box", background: "#F8FAFC",
          transition: "border-color 0.15s",
        }}
      />
      {error && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#DC2626" }}>{error}</p>}
    </div>
  );
}
