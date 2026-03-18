"use client";

import { createContext, useContext } from "react";
import { tenantConfig, TenantConfig } from "@/config/tenant";

const TenantContext = createContext<TenantConfig>(tenantConfig);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={tenantConfig}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
