"use server";

import { db }          from "@/lib/db";
import { auth }        from "@/auth";
import { revalidatePath } from "next/cache";

export type AppNotification = {
  id:        string;
  title:     string;
  body:      string;
  type:      string;
  read:      boolean;
  data:      string | null;
  createdAt: Date;
};

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await db.notification.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take:    30,
    });
  } catch (err) {
    console.error("[notifications] getNotifications error:", err);
    return [];
  }
}

export async function markAllAsRead(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data:  { read: true },
  });
}

export async function activateCompany(
  companyUserId: string,
  notificationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" };
  }

  // Valida que a notificação existe e pertence ao companyUserId (evita IDOR)
  const notification = await db.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== companyUserId) {
    return { ok: false, error: "Notificação inválida." };
  }

  // Valida que o usuário alvo tem role COMPANY
  const targetUser = await db.user.findUnique({
    where:  { id: companyUserId },
    select: { role: true },
  });
  if (!targetUser || targetUser.role !== "COMPANY") {
    return { ok: false, error: "Usuário não é uma empresa." };
  }

  await db.user.update({
    where: { id: companyUserId },
    data:  { status: "ACTIVE" },
  });

  await db.notification.update({
    where: { id: notificationId },
    data:  { read: true },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
