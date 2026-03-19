"use client";

import { useActionState, useState } from "react";
import { useRouter }                from "next/navigation";
import {
  Building2, User, Lock,
  Phone, Mail, Briefcase, ChevronRight, ChevronLeft,
  Check, Eye, EyeOff, AlertCircle, Loader2,
} from "lucide-react";

import { signupAction, type SignupState } from "@/app/actions/signup";
import { InputField }                     from "@/components/ui/input-field";
import { tenantConfig }                   from "@/config/tenant";

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

// ── Segmentos ─────────────────────────────────────────────────────────────────

const SEGMENTS = [
  "Transportadora",
  "E-commerce",
  "Indústria",
  "Varejo",
  "Agronegócio",
  "Construção Civil",
  "Farmacêutico",
  "Outro",
];

// ── Stepper ───────────────────────────────────────────────────────────────────

const STEPS = ["Empresa", "Responsável", "Acesso"];

function Stepper({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            {/* Círculo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13,
                background: done
                  ? t.primary
                  : active
                  ? "#fff"
                  : "#F0F3F8",
                border: active
                  ? `2px solid ${t.primary}`
                  : done
                  ? `2px solid ${t.primary}`
                  : "2px solid #DDE3EC",
                color: done ? "#fff" : active ? t.primary : "#9CA8B8",
                transition: "all 0.25s",
                boxShadow: active ? `0 0 0 4px ${t.primary}18` : "none",
              }}>
                {done ? <Check style={{ width: 15, height: 15 }} /> : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 700 : 500,
                color: active ? t.primary : done ? t.textPrimary : "#9CA8B8",
                whiteSpace: "nowrap", transition: "color 0.2s",
              }}>
                {label}
              </span>
            </div>
            {/* Linha */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 20, marginLeft: 8, marginRight: 8,
                background: done ? t.primary : "#E8EDF2",
                borderRadius: 2, transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Empresa ───────────────────────────────────────────────────────────

function StepEmpresa({
  data, set, errors,
}: {
  data: Record<string, string>;
  set:  (k: string, v: string) => void;
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
          required
          value={data.phone}
          onChange={(e) => set("phone", maskPhone(e.target.value))}
          error={errors.phone}
          leftIcon={<Phone style={{ width: 16, height: 16 }} />}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
          Segmento <span style={{ color: t.error }}>*</span>
        </label>
        <select
          value={data.segment}
          onChange={(e) => set("segment", e.target.value)}
          style={{
            height: 48, padding: "0 14px",
            borderRadius: 12,
            border: `1.5px solid ${errors.segment ? t.error : "#DDE3EC"}`,
            background: "#F7F9FC",
            color: data.segment ? t.textPrimary : "#9CA8B8",
            fontSize: 14, outline: "none",
            cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA8B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: 40,
          }}
        >
          <option value="" disabled>Selecione o segmento</option>
          {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.segment && (
          <p style={{ margin: 0, fontSize: 12, color: t.error }}>{errors.segment}</p>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Responsável ───────────────────────────────────────────────────────

function StepResponsavel({
  data, set, errors,
}: {
  data: Record<string, string>;
  set:  (k: string, v: string) => void;
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
  data, set, errors, terms, setTerms,
}: {
  data: Record<string, string>;
  set:  (k: string, v: string) => void;
  errors: Record<string, string>;
  terms: boolean;
  setTerms: (v: boolean) => void;
}) {
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 8,
        border: "none", background: "transparent",
        color: t.textSecondary, cursor: "pointer",
        transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = t.primary; e.currentTarget.style.background = t.primaryLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = t.textSecondary; e.currentTarget.style.background = "transparent"; }}
    >
      {show ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <InputField
        label="Senha"
        name="password"
        type={showPass ? "text" : "password"}
        placeholder="Mínimo 8 caracteres"
        required
        value={data.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
        leftIcon={<Lock style={{ width: 16, height: 16 }} />}
        rightElement={eyeBtn(showPass, () => setShowPass((v) => !v))}
        helper="Use letras, números e símbolos para maior segurança"
      />

      {/* Indicador de força da senha */}
      {data.password.length > 0 && (
        <PasswordStrength password={data.password} />
      )}

      <InputField
        label="Confirmar senha"
        name="confirmPassword"
        type={showConfirm ? "text" : "password"}
        placeholder="Repita a senha"
        required
        value={data.confirmPassword}
        onChange={(e) => set("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        leftIcon={<Lock style={{ width: 16, height: 16 }} />}
        rightElement={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))}
      />

      {/* Termos */}
      <label style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        cursor: "pointer", userSelect: "none",
      }}>
        <div
          onClick={() => setTerms(!terms)}
          style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
            border: `2px solid ${terms ? t.primary : errors.terms ? t.error : "#DDE3EC"}`,
            background: terms ? t.primary : "#F7F9FC",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.18s", cursor: "pointer",
          }}
        >
          {terms && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
        </div>
        <span style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.55 }}>
          Li e concordo com os{" "}
          <a href="/termos" style={{ color: t.primary, fontWeight: 600 }}>Termos de Uso</a>
          {" "}e a{" "}
          <a href="/privacidade" style={{ color: t.primary, fontWeight: 600 }}>Política de Privacidade</a>
          {" "}da plataforma.
        </span>
      </label>
      {errors.terms && (
        <p style={{ margin: "-10px 0 0", fontSize: 12, color: t.error }}>{errors.terms}</p>
      )}
    </div>
  );
}

// ── Força da senha ────────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = [
    { label: "Fraca",   color: t.error   },
    { label: "Razoável",color: t.warning  },
    { label: "Boa",     color: t.warning  },
    { label: "Forte",   color: t.success  },
  ];
  const level = levels[score - 1] ?? levels[0];

  return (
    <div style={{ marginTop: -8, display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? level.color : "#E8EDF2",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11.5, color: level.color, fontWeight: 600 }}>
        Senha {level.label}
      </span>
    </div>
  );
}

// ── Form principal ────────────────────────────────────────────────────────────

const INITIAL: Record<string, string> = {
  companyName: "", cnpj: "", phone: "", segment: "",
  fullName: "", email: "", position: "",
  password: "", confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<SignupState, FormData>(signupAction, null);
  const [step,    setStep]    = useState(0);
  const [data,    setData]    = useState(INITIAL);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [terms,   setTerms]   = useState(false);

  const set = (key: string, val: string) => {
    setData((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  // ── Validação por etapa ───────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.companyName.trim())         errs.companyName = "Obrigatório";
      if (data.cnpj.replace(/\D/g, "").length < 14) errs.cnpj = "CNPJ inválido";
      if (data.phone.replace(/\D/g, "").length < 10) errs.phone = "Telefone inválido";
      if (!data.segment)                    errs.segment = "Selecione um segmento";
    }
    if (step === 1) {
      if (!data.fullName.trim())  errs.fullName = "Obrigatório";
      if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "E-mail inválido";
    }
    if (step === 2) {
      if (data.password.length < 8)         errs.password = "Mínimo 8 caracteres";
      if (data.password !== data.confirmPassword) errs.confirmPassword = "As senhas não coincidem";
      if (!terms)                            errs.terms = "Você precisa aceitar os termos";
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

  // ── Monta FormData com todos os dados antes de submeter ───────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (step < 2) { e.preventDefault(); handleNext(); return; }
    if (!validate()) { e.preventDefault(); return; }
    // Injeta todos os campos no FormData via hidden inputs
  }

  const stepProps = { data, set, errors };

  return (
    <form action={action} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Hidden inputs com todos os dados */}
      {Object.entries(data).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="terms" value={String(terms)} />

      <Stepper current={step} />

      {/* Conteúdo da etapa */}
      <div style={{ minHeight: 260 }}>
        {step === 0 && <StepEmpresa     {...stepProps} />}
        {step === 1 && <StepResponsavel {...stepProps} />}
        {step === 2 && <StepAcesso      {...stepProps} terms={terms} setTerms={setTerms} />}
      </div>

      {/* Erro global (vindo do servidor) */}
      {state?.error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          fontSize: 13, padding: "11px 14px", borderRadius: t.radiusMd,
          color: t.error, background: "#FFF1F0",
          border: `1px solid ${t.error}22`,
          marginTop: 20,
        }}>
          <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
          {state.error}
        </div>
      )}

      {/* Ações */}
      <div style={{
        display: "flex", gap: 10, marginTop: 28,
        flexDirection: step === 0 ? "row-reverse" : "row",
      }}>
        {/* Botão Próximo / Criar conta */}
        <button
          type={step === 2 ? "submit" : "button"}
          onClick={step < 2 ? handleNext : undefined}
          disabled={pending}
          style={{
            flex: 1, height: 48,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 12,
            background: pending ? t.border : "linear-gradient(135deg, #0C6B64 0%, #1ABFB8 100%)",
            color: "#fff", fontWeight: 700, fontSize: 14.5,
            border: "none", cursor: pending ? "not-allowed" : "pointer",
            boxShadow: pending ? "none" : `0 4px 18px ${t.primary}40`,
            transition: "all 0.2s",
            letterSpacing: "0.01em",
          }}
        >
          {pending ? (
            <><Loader2 style={{ width: 16, height: 16, animation: "spin 0.9s linear infinite" }} /> Criando…</>
          ) : step === 2 ? (
            <><Check style={{ width: 16, height: 16 }} /> Criar conta</>
          ) : (
            <>Próximo <ChevronRight style={{ width: 16, height: 16 }} /></>
          )}
        </button>

        {/* Botão Voltar */}
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            style={{
              height: 48, padding: "0 20px",
              display: "flex", alignItems: "center", gap: 6,
              borderRadius: 12, border: `1.5px solid #DDE3EC`,
              background: "#fff", color: t.textSecondary,
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#DDE3EC"; e.currentTarget.style.color = t.textSecondary; }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} />
            Voltar
          </button>
        )}
      </div>
    </form>
  );
}
