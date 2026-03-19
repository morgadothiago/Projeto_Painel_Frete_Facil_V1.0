import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.SMTP_FROM_NAME ?? "FreteFácil"}" <${process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER}>`;
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "suporte@fretefacil.com";

// ── Templates ─────────────────────────────────────────────────

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FreteFácil</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0C6B64 0%,#2EC4B6 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              Frete<span style="opacity:0.85;">Fácil</span>
            </h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.70);">Plataforma de fretes inteligente</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #F1F5F9;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.7;">
              Precisa de ajuda? Entre em contato:<br/>
              <a href="mailto:${SUPPORT_EMAIL}" style="color:#0C6B64;font-weight:600;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#CBD5E1;">
              © ${new Date().getFullYear()} FreteFácil. Todos os direitos reservados.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Envio de e-mails específicos ──────────────────────────────

export async function sendAccountBlockedEmail(to: string, name: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:#FFF1F2;margin-bottom:16px;">
        <span style="font-size:32px;">🚫</span>
      </div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.3px;">Conta bloqueada</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#64748B;">Olá, <strong>${name}</strong></p>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Infelizmente sua conta foi <strong style="color:#BE123C;">bloqueada</strong> devido à falta de pagamento da mensalidade da plataforma FreteFácil.
    </p>

    <div style="background:#FFF1F2;border-left:4px solid #F43F5E;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#BE123C;font-weight:700;">O que isso significa?</p>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:13.5px;color:#64748B;line-height:1.8;">
        <li>Seu acesso à plataforma está temporariamente suspenso</li>
        <li>Seus dados e histórico estão preservados</li>
        <li>O acesso será restaurado após a regularização</li>
      </ul>
    </div>

    <p style="margin:20px 0 8px;font-size:14px;color:#334155;line-height:1.7;">
      Para regularizar sua situação e reativar sua conta, entre em contato com nossa equipe de suporte:
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="mailto:${SUPPORT_EMAIL}"
        style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#0C6B64,#2EC4B6);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(12,107,100,0.30);">
        Entrar em contato com o suporte
      </a>
    </div>`;

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: "🚫 Sua conta foi bloqueada — FreteFácil",
    html:    baseLayout(content),
  });
}

export async function sendAccountPendingEmail(to: string, name: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:#FFFBEB;margin-bottom:16px;">
        <span style="font-size:32px;">⚠️</span>
      </div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.3px;">Pagamento pendente</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#64748B;">Olá, <strong>${name}</strong></p>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Identificamos uma <strong style="color:#B45309;">pendência no pagamento</strong> da sua mensalidade na plataforma FreteFácil.
    </p>

    <div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#B45309;font-weight:700;">Atenção!</p>
      <p style="margin:6px 0 0;font-size:13.5px;color:#64748B;line-height:1.7;">
        Regularize seu pagamento o quanto antes para evitar o bloqueio da sua conta e manter o acesso a todos os recursos da plataforma.
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="mailto:${SUPPORT_EMAIL}"
        style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#B45309,#F59E0B);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(180,83,9,0.30);">
        Regularizar pagamento
      </a>
    </div>`;

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: "⚠️ Pagamento pendente — FreteFácil",
    html:    baseLayout(content),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:#EFF6FF;margin-bottom:16px;">
        <span style="font-size:32px;">🔑</span>
      </div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.3px;">Redefinição de senha</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#64748B;">Olá, <strong>${name}</strong></p>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar:
    </p>

    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:16px;padding:20px 48px;">
        <p style="margin:0;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Seu código</p>
        <p style="margin:0;font-size:40px;font-weight:900;color:#0C6B64;letter-spacing:10px;font-family:monospace;">${code}</p>
      </div>
    </div>

    <div style="background:#EFF6FF;border-left:4px solid #3B82F6;border-radius:0 10px 10px 0;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#1D4ED8;line-height:1.6;">
        ⏱ Este código expira em <strong>15 minutos</strong>.<br/>
        Se você não solicitou a redefinição, ignore este e-mail.
      </p>
    </div>`;

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: "🔑 Código para redefinir sua senha — FreteFácil",
    html:    baseLayout(content),
  });
}

export async function sendAccountActivatedEmail(to: string, name: string) {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:18px;background:#F0FDF4;margin-bottom:16px;">
        <span style="font-size:32px;">✅</span>
      </div>
      <h2 style="margin:0;font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.3px;">Conta reativada!</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#64748B;">Olá, <strong>${name}</strong></p>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
      Ótima notícia! Sua conta foi <strong style="color:#15803D;">reativada com sucesso</strong>. Você já pode acessar a plataforma FreteFácil normalmente.
    </p>

    <div style="background:#F0FDF4;border-left:4px solid #22C55E;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-size:13.5px;color:#15803D;line-height:1.7;">
        Todos os seus dados, histórico e configurações foram preservados. Bem-vindo(a) de volta!
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXTAUTH_URL ?? "https://fretefacil.com"}/dashboard"
        style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#0C6B64,#2EC4B6);color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(12,107,100,0.30);">
        Acessar a plataforma
      </a>
    </div>`;

  await transporter.sendMail({
    from:    FROM,
    to,
    subject: "✅ Conta reativada — FreteFácil",
    html:    baseLayout(content),
  });
}
