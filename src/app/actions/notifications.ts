"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data: string | null;
  createdAt: Date;
};

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const token = (session as any).accessToken;
    if (!token) return [];

    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const result = await res.json();
    return (result.data ?? []).map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }));
  } catch (err) {
    console.error("[notifications] getNotifications error:", err);
    return [];
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const token = (session as any).accessToken;
    if (!token) return;

    await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("[notifications] markAllAsRead error:", err);
  }
}

export async function activateCompany(
  companyUserId: string,
  notificationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "Sem permissão" };
  }

  const token = (session as any).accessToken;

  try {
    // Ativa o usuário via API
    const res = await fetch(`${API_BASE_URL}/api/users/${companyUserId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "ACTIVE" }),
    });

    if (!res.ok) return { ok: false, error: "Erro ao ativar empresa" };

    // Marca notificação como lida
    await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[notifications] activateCompany error:", err);
    return { ok: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const token = (session as any).accessToken;
    if (!token) return;

    // API não tem endpoint de deletar todas, então marca como lidas
    await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("[notifications] clearAllNotifications error:", err);
  }
}
