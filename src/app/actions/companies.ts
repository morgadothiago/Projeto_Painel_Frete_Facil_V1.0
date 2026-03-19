"use server";

import { db }          from "@/lib/db";
import { auth }        from "@/auth";
import { revalidatePath } from "next/cache";
import {
  sendAccountBlockedEmail,
  sendAccountPendingEmail,
  sendAccountActivatedEmail,
} from "@/lib/mailer";

export type CompanyRow = {
  id:        string;
  userId:    string;
  cnpj:      string;
  tradeName: string | null;
  status:    string;
  name:      string;
  email:     string;
  phone:     string | null;
  createdAt: Date;
};

export async function getCompanies(): Promise<CompanyRow[]> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão");
  }

  const companies = await db.company.findMany({
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
  });

  return companies.map((c) => ({
    id:        c.id,
    userId:    c.userId,
    cnpj:      c.cnpj,
    tradeName: c.tradeName,
    status:    c.user.status,
    name:      c.user.name,
    email:     c.user.email,
    phone:     c.user.phone,
    createdAt: c.user.createdAt,
  }));
}

const STATUS_NOTIFICATION: Record<"ACTIVE" | "PENDING" | "INACTIVE", {
  type: string; title: string; body: string;
}> = {
  ACTIVE: {
    type:  "ACCOUNT_ACTIVATED",
    title: "Conta reativada ✅",
    body:  "Sua conta foi reativada com sucesso. Você já pode utilizar a plataforma normalmente.",
  },
  PENDING: {
    type:  "PAYMENT_PENDING",
    title: "Pagamento pendente ⚠️",
    body:  "Identificamos uma pendência no pagamento da sua mensalidade. Regularize para continuar usando a plataforma.",
  },
  INACTIVE: {
    type:  "ACCOUNT_BLOCKED",
    title: "Conta bloqueada 🚫",
    body:  "Sua conta foi bloqueada por falta de pagamento da mensalidade. Entre em contato com o suporte para regularizar.",
  },
};

export async function updateCompanyStatus(
  userId: string,
  status: "ACTIVE" | "PENDING" | "INACTIVE",
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" };
  }

  // Valida que o alvo existe e tem role COMPANY (impede alterar status de admins)
  const targetUser = await db.user.findUnique({
    where:  { id: userId },
    select: { role: true, email: true, name: true },
  });
  if (!targetUser || targetUser.role !== "COMPANY") {
    return { ok: false, error: "Usuário inválido." };
  }

  await db.user.update({
    where: { id: userId },
    data:  { status },
  });

  const notif = STATUS_NOTIFICATION[status];
  await db.notification.create({
    data: {
      userId,
      type:  notif.type,
      title: notif.title,
      body:  notif.body,
      read:  false,
    },
  });

  // Log de auditoria
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event:     "company_status_changed",
    adminId:   session.user.id,
    targetId:  userId,
    newStatus: status,
  }));

  // Enviar e-mail em background
  void (async () => {
    try {
      if (status === "INACTIVE") await sendAccountBlockedEmail(targetUser.email, targetUser.name);
      if (status === "PENDING")  await sendAccountPendingEmail(targetUser.email, targetUser.name);
      if (status === "ACTIVE")   await sendAccountActivatedEmail(targetUser.email, targetUser.name);
    } catch (err) {
      console.error("[mailer] Erro ao enviar e-mail de status:", err);
    }
  })();

  revalidatePath("/dashboard/empresas");
  revalidatePath("/dashboard/faturamento");
  return { ok: true };
}
