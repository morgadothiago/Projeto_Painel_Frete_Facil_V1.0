"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster }         from "sonner";
import { TenantProvider }  from "./context/TenantContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TenantProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: "var(--font-geist-sans)" },
          }}
        />
      </TenantProvider>
    </SessionProvider>
  );
}
