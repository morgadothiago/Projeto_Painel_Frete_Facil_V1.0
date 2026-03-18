"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="input"
        />
      </div>

      {state?.error && (
        <p
          className="text-sm px-4 py-3 rounded-theme"
          style={{
            color:      "#dc2626",
            background: "#fef2f2",
            border:     "1px solid #fecaca",
          }}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full mt-2 py-3.5 text-base"
        style={{ opacity: pending ? 0.7 : 1 }}
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

    </form>
  );
}
