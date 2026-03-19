"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Props {
  userName: string;
}

export function WelcomeToast({ userName }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (sessionStorage.getItem("showWelcome") !== "1") return;

    fired.current = true;
    sessionStorage.removeItem("showWelcome");

    const first = userName.split(" ")[0];
    toast.success(`Bem-vindo de volta, ${first}! 👋`, {
      description: "Você entrou na plataforma com sucesso.",
      duration: 4000,
    });
  }, [userName]);

  return null;
}
