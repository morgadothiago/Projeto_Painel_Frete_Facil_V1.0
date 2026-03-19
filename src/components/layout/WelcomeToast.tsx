"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
  userName: string;
}

export function WelcomeToast({ userName }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const fired        = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (searchParams.get("welcome") !== "1") return;

    fired.current = true;

    const first = userName.split(" ")[0];
    toast.success(`Bem-vindo de volta, ${first}! 👋`, {
      description: "Você entrou na plataforma com sucesso.",
      duration: 4000,
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("welcome");
    const newUrl = params.size > 0 ? `?${params}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
