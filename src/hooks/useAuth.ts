"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading       = status === "loading";

  async function login(email: string, password: string) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) throw new Error(result.error);
    return result;
  }

  async function logout() {
    await signOut({ redirectTo: "/" });
  }

  return {
    session,
    user:            session?.user,
    accessToken:     session?.accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
