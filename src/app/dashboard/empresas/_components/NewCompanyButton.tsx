"use client";

import { useState } from "react";
import {
  Building2, User, Lock, Phone, Mail, Briefcase,
  ChevronRight, ChevronLeft, Check, Plus, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { InputField } from "@/components/ui/input-field";
import { createCompanyAction } from "@/app/actions/companies";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

// ── Helpers de máscara ────────────────────────────────────────────────────────

function maskCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const SIGNUP_STEPS = [
  { label: "Empresa" },
  { label: "Responsável" },
  { label: "Acesso" },
];

const INITIAL: Record<string, string> = {
  companyName: "", cnpj: "", phone: "",
  fullName: "", email: "", position: "",
  password: "", confirmPassword: "",
};

// ── Step 1: Empresa ───────────────────────────────────────────────────────────

function StepEmpresa({
  data, set, errors,
}: {
  data: Record<string, string>;
  set: (k: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InputField
        label="Nome da empresa"
        name="companyName"
        placeholder="Ex: Transportes Silva Ltda"
        required
        value={data.companyName}
        onChange={(e) => set("companyName", e.target.value)}
        error={errors.companyName}
        leftIcon={<Building2 style={{ width: 16, height: 16 }} />}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <InputField
          label="CNPJ"
          name="cnpj"
          placeholder="00.000.000/0001-00"
          required
          value={data.cnpj}
          onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
          error={errors.cnpj}
        />
        <InputField
          label="Telefone"
          name="phone"
          placeholder="(11) 99999-9999"
          value={data.phone}
          onChange={(e) => set("phone", maskPhone(e.target.value))}
          error={errors.phone}
          leftIcon={<Phone style={{ width: 16, height: 16 }} />}
        />
      </div>
    </div>
  );
}

// ── Step 2: Responsável ───────────────────────────────────────────────────────

function StepResponsavel({
  data, set, errors,
}: {
  data: Record<string, string>;
  set: (k: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InputField
        label="Nome completo"
        name="fullName"
        placeholder="Ex: Maria da Silva"
        required
        value={data.fullName}
        onChange={(e) => set("fullName", e.target.value)}
        error={errors.fullName}
        leftIcon={<User style={{ width: 16, height: 16 }} />}
      />
      <InputField
        label="E-mail corporativo"
        name="email"
        type="text"
        placeholder="nome@empresa.com.br"
        required
        value={data.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        leftIcon={<Mail style={{ width: 16, height: 16 }} />}
      />
      <InputField
        label="Cargo"
        name="position"
        placeholder="Ex: Gerente de Logística"
        value={data.position}
        onChange={(e) => set("position", e.target.value)}
        leftIcon={<Briefcase style={{ width: 16, height: 16 }} />}
      />
    </div>
  );
}

// ── Step 3: Acesso ────────────────────────────────────────────────────────────

function StepAcesso({
  data, set, errors,
}: {
  data: Record<string, string>;
  set: (k: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InputField
        label="Senha"
        name="password"
        type="password"
        placeholder="Mínimo 6 caracteres"
        required
        value={data.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
        leftIcon={<Lock style={{ width: 16, height: 16 }} />}
      />
      <InputField
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        placeholder="Repita a senha"
        required
        value={data.confirmPassword}
        onChange={(e) => set("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        leftIcon={<Lock style={{ width: 16, height: 16 }} />}
      />
    </div>
  );
}

// ── Botão principal ───────────────────────────────────────────────────────────

export function NewCompanyButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setData((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  function reset() {
    setStep(0);
    setData(INITIAL);
    setErrors({});
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.companyName.trim()) errs.companyName = "Obrigatório";
      if (data.cnpj.replace(/\D/g, "").length < 14) errs.cnpj = "CNPJ inválido";
    }
    if (step === 1) {
      if (!data.fullName.trim()) errs.fullName = "Obrigatório";
      if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "E-mail inválido";
    }
    if (step === 2) {
      if (data.password.length < 6) errs.password = "Mínimo 6 caracteres";
      if (data.password !== data.confirmPassword) errs.confirmPassword = "As senhas não coincidem";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrors({});
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    const res = await createCompanyAction({
      name: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
      tradeName: data.companyName,
      cnpj: data.cnpj,
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Empresa criada com sucesso!");
      setOpen(false);
      reset();
      window.location.reload();
    } else {
      toast.error(res.error ?? "Erro ao criar empresa");
    }
  }

  const stepProps = { data, set, errors };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 10,
          background: "#0C6B64", color: "#ffffff",
          fontSize: 13.5, fontWeight: 600, border: "none", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(12,107,100,0.28)",
          transition: "filter 0.15s, transform 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
        Nova empresa
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent
          className="sm:max-w-[500px] p-0 overflow-hidden"
          style={{ borderRadius: 16, padding: 0 }}
        >
          <div style={{ background: "linear-gradient(135deg, #0C6B64, #2EC4B6)", padding: "28px 32px" }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Nova Empresa</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "4px 0 0" }}>
              Preencha os dados para cadastrar a empresa
            </p>
          </div>

          <div style={{ padding: "24px 32px 32px" }}>
            <div style={{ marginBottom: 28 }}>
              <Stepper steps={SIGNUP_STEPS} current={step} />
            </div>

            <div style={{ minHeight: 200 }}>
              {step === 0 && <StepEmpresa     {...stepProps} />}
              {step === 1 && <StepResponsavel {...stepProps} />}
              {step === 2 && <StepAcesso      {...stepProps} />}
            </div>

            {/* Ações */}
            <div style={{
              display: "flex", gap: 10, marginTop: 28,
              flexDirection: step === 0 ? "row-reverse" : "row",
            }}>
              <button
                type="button"
                onClick={step < 2 ? handleNext : handleSubmit}
                disabled={loading}
                style={{
                  flex: 1, height: 46,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  borderRadius: 12,
                  background: loading ? "#ccc" : "linear-gradient(135deg, #0C6B64 0%, #1ABFB8 100%)",
                  color: "#fff", fontWeight: 700, fontSize: 14,
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 18px rgba(12,107,100,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <><Loader2 style={{ width: 16, height: 16, animation: "spin 0.9s linear infinite" }} /> Criando…</>
                ) : step === 2 ? (
                  <><Check style={{ width: 16, height: 16 }} /> Criar empresa</>
                ) : (
                  <>Próximo <ChevronRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>

              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    height: 46, padding: "0 20px",
                    display: "flex", alignItems: "center", gap: 6,
                    borderRadius: 12, border: "1.5px solid #DDE3EC",
                    background: "#fff", color: "#64748B",
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                >
                  <ChevronLeft style={{ width: 15, height: 15 }} />
                  Voltar
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
