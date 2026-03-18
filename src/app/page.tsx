import { tenantConfig } from "@/config/tenant";
import { LoginForm } from "@/app/_components/LoginForm";

// Server Component — sem "use client"
// O tenant vem direto do config (sem hook), o form é Client Component isolado
export default function LoginPage() {
  const { name, theme } = tenantConfig;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.background} 60%)`,
      }}
    >
      {/* Decoração de fundo */}
      <div
        className="fixed top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:  theme.primaryColor,
          opacity:     0.12,
          transform:   "translate(30%, -30%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: theme.primaryColor,
          opacity:    0.07,
          transform:  "translate(-30%, 30%)",
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo / marca */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{
              background: theme.primaryColor,
              boxShadow:  `0 8px 24px ${theme.primaryColor}40`,
            }}
          >
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
              <rect x="2" y="14" width="28" height="20" rx="3" fill="white" />
              <path d="M30 20h6l6 7v7h-12V20z" fill="white" />
              <circle cx="11" cy="36" r="4" fill={theme.primaryDark} />
              <circle cx="35" cy="36" r="4" fill={theme.primaryDark} />
            </svg>
          </div>

          <h1
            className="text-3xl font-bold"
            style={{ color: theme.primaryColor }}
          >
            {name}
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.mutedForeground }}>
            Seu transporte de carga ao toque de um dedo
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2
            className="text-xl font-semibold text-center mb-6"
            style={{ color: theme.foreground }}
          >
            Entrar na plataforma
          </h2>

          {/* Formulario — Client Component */}
          <LoginForm />

          <div className="mt-4 text-center">
            <a
              href="#"
              className="text-sm font-medium"
              style={{ color: theme.primaryColor }}
            >
              Esqueci minha senha
            </a>
          </div>
        </div>

        {/* Rodape */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: theme.mutedForeground }}
        >
          Nao tem conta?{" "}
          <a
            href="/signup"
            className="font-semibold"
            style={{ color: theme.primaryColor }}
          >
            Criar conta
          </a>
        </p>

      </div>
    </main>
  );
}
