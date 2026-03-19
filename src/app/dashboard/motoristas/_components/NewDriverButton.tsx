"use client";

import { useState } from "react";
import { Plus, Loader2, User, MapPin, Lock, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { createDriver } from "@/app/actions/drivers";

const DRIVER_STEPS = [
  { label: "Pessoal",  icon: <User   style={{ width: 16, height: 16 }} /> },
  { label: "Endereço", icon: <MapPin style={{ width: 16, height: 16 }} /> },
  { label: "Acesso",   icon: <Lock   style={{ width: 16, height: 16 }} /> },
];

interface FormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormData = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  password: "",
  confirmPassword: "",
};

export function NewDriverButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepBlur = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        updateField("street", data.logradouro);
        updateField("neighborhood", data.bairro);
        updateField("city", data.localidade);
        updateField("state", data.uf);
      }
    } catch {
      //
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.cpf || !form.email) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
    }
    if (step === 2) {
      if (!form.cep || !form.street || !form.number || !form.neighborhood || !form.city || !form.state) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    const res = await createDriver({
      name: form.name,
      email: form.email,
      cpf: form.cpf,
      phone: form.phone || undefined,
      password: form.password,
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Motorista criado com sucesso!");
      setOpen(false);
      setStep(1);
      setForm(initialForm);
      window.location.reload();
    } else {
      toast.error(res.error ?? "Erro ao criar motorista");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #2EC4B6 0%, #1FA7A1 100%)",
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(46, 196, 182, 0.35)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.transform = "translateY(-1px)";
          btn.style.boxShadow = "0 6px 20px rgba(46, 196, 182, 0.45)";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.transform = "translateY(0)";
          btn.style.boxShadow = "0 4px 12px rgba(46, 196, 182, 0.35)";
        }}
      >
        <Plus style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
        Novo Motorista
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[480px] p-0 overflow-hidden"
          style={{ borderRadius: 16, padding: 0 }}
        >
          <div style={{ background: "linear-gradient(135deg, #2EC4B6 0%, #1FA7A1 100%)", padding: "28px 32px" }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Novo Motorista</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "4px 0 0" }}>
              Preencha os dados para criar a conta
            </p>
          </div>

          <div style={{ padding: "24px 32px 32px" }}>
            <div style={{ marginBottom: 28 }}>
              <Stepper
                steps={DRIVER_STEPS}
                current={step - 1}
                activeColor="#2EC4B6"
                completeColor="#4CAF50"
              />
            </div>

            <div style={{ minHeight: 280 }}>
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Nome completo *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="Maria Silva Santos"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>CPF *</label>
                    <input
                      type="text"
                      value={form.cpf}
                      onChange={(e) => updateField("cpf", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>E-mail *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="maria@email.com"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Telefone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>CEP *</label>
                      <input
                        type="text"
                        value={form.cep}
                        onChange={(e) => updateField("cep", e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                        onBlur={(e) => { e.target.style.borderColor = "#E8EDF2"; handleCepBlur(); }}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Estado *</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                        maxLength={2}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Logradouro *</label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="Rua das Flores"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Número *</label>
                      <input
                        type="text"
                        value={form.number}
                        onChange={(e) => updateField("number", e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Complemento</label>
                      <input
                        type="text"
                        value={form.complement}
                        onChange={(e) => updateField("complement", e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                        placeholder="Apto 12"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Bairro *</label>
                    <input
                      type="text"
                      value={form.neighborhood}
                      onChange={(e) => updateField("neighborhood", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Cidade *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div
                    style={{
                      background: "#F5F7FA",
                      borderRadius: 12,
                      padding: 16,
                      border: "1px solid #E8EDF2",
                      marginBottom: 4,
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#9E9E9E", margin: "0 0 8px" }}>Resumo</p>
                    <p style={{ fontSize: 13, color: "#333333", margin: "0 0 4px" }}><strong>{form.name}</strong></p>
                    <p style={{ fontSize: 12, color: "#9E9E9E", margin: 0 }}>{form.email} · {form.cpf}</p>
                    {form.phone && <p style={{ fontSize: 12, color: "#9E9E9E", margin: "4px 0 0" }}>{form.phone}</p>}
                    <p style={{ fontSize: 12, color: "#9E9E9E", margin: "8px 0 0" }}>
                      {form.street}, {form.number}{form.complement ? `, ${form.complement}` : ""} — {form.neighborhood}, {form.city}/{form.state}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Senha *</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#333333", display: "block", marginBottom: 6 }}>Confirmar senha *</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E8EDF2", fontSize: 14, outline: "none", transition: "border-color 0.15s", background: "#fff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2EC4B6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E8EDF2")}
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "13px",
                    borderRadius: 12,
                    background: "#F5F7FA",
                    color: "#333333",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#E8EDF2")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "#F5F7FA")}
                >
                  <ChevronLeft style={{ width: 16, height: 16 }} />
                  Voltar
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "13px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #2EC4B6 0%, #1FA7A1 100%)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    btn.style.boxShadow = "0 4px 16px rgba(46, 196, 182, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.boxShadow = "none";
                  }}
                >
                  Próximo
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #4CAF50 0%, #43A047 100%)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      const btn = e.currentTarget;
                      btn.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
                      btn.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    btn.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
                    btn.style.transform = "translateY(0)";
                  }}
                >
                  {loading ? (
                    <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Check style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
                  )}
                  {loading ? "Criando..." : "Criar Motorista"}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
