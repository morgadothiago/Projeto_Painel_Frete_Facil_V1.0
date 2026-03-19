import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export type LoginResponse = {
  access_token: string;
  user: {
    id:    string;
    name:  string;
    email: string;
    role:  string;
  };
};

// ─── Toggle mock/DB/API ───────────────────────────────────────────────────────
// NEXT_PUBLIC_USE_MOCK=true  → dados falsos (sem banco, sem API)
// NEXT_PUBLIC_USE_MOCK=false → banco de dados local (Prisma/SQLite)
// Quando tiver API externa: troque loginRequest para chamar a API
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse | null> {

  if (USE_MOCK) {
    const { mockLogin } = await import("./mock/auth.mock");
    const result = await mockLogin(email, password);
    if (!result) return null;
    return result;
  }

  // Login direto no banco via Prisma
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return {
      access_token: "db-session",
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    };
  } catch (err) {
    console.error("[authService] loginRequest error:", err);
    return null;
  }
}
