"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

function createAuthApi(token: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

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

    const api = createAuthApi((session as any).accessToken);

    const { data: result } = await api.get("/api/notifications");

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

    const api = createAuthApi((session as any).accessToken);
    await api.patch("/api/notifications/read-all");
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

  const api = createAuthApi((session as any).accessToken);

  try {
    // Ativa o usuário via API
    await api.patch(`/api/users/${companyUserId}/status`, { status: "ACTIVE" });

    // Marca notificação como lida
    await api.patch("/api/notifications/read-all");

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>
    return { ok: false, error: axiosErr.response?.data?.message ?? "Erro ao ativar empresa" };
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const api = createAuthApi((session as any).accessToken);
    await api.delete("/api/notifications/clear-all");
  } catch (err) {
    console.error("[notifications] clearAllNotifications error:", err);
  }
}
