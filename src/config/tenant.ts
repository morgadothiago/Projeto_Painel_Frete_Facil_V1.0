export type TenantConfig = {
  name: string;
  shortName: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  supportPhone: string;
  theme: {
    primaryColor: string;
    primaryForeground: string;
    primaryLight: string;
    primaryDark: string;
    secondaryColor: string;
    secondaryForeground: string;
    accentColor: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    radius: string;
  };
};

export const tenantConfig: TenantConfig = {
  name:         process.env.NEXT_PUBLIC_BRAND_NAME          ?? "FreteFácil",
  shortName:    process.env.NEXT_PUBLIC_BRAND_SHORT_NAME    ?? "FF",
  logoUrl:      process.env.NEXT_PUBLIC_BRAND_LOGO_URL      ?? "/logo.svg",
  faviconUrl:   process.env.NEXT_PUBLIC_BRAND_FAVICON_URL   ?? "/favicon.ico",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL       ?? "suporte@fretefacil.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE       ?? "",
  theme: {
    primaryColor:        process.env.NEXT_PUBLIC_COLOR_PRIMARY              ?? "#00C9B5",
    primaryForeground:   process.env.NEXT_PUBLIC_COLOR_PRIMARY_FOREGROUND   ?? "#ffffff",
    primaryLight:        process.env.NEXT_PUBLIC_COLOR_PRIMARY_LIGHT        ?? "#E6FAF8",
    primaryDark:         process.env.NEXT_PUBLIC_COLOR_PRIMARY_DARK         ?? "#00A896",
    secondaryColor:      process.env.NEXT_PUBLIC_COLOR_SECONDARY            ?? "#475569",
    secondaryForeground: process.env.NEXT_PUBLIC_COLOR_SECONDARY_FOREGROUND ?? "#ffffff",
    accentColor:         process.env.NEXT_PUBLIC_COLOR_ACCENT               ?? "#FFD600",
    accentForeground:    process.env.NEXT_PUBLIC_COLOR_ACCENT_FOREGROUND    ?? "#1A1A2E",
    background:          process.env.NEXT_PUBLIC_COLOR_BACKGROUND           ?? "#ffffff",
    foreground:          process.env.NEXT_PUBLIC_COLOR_FOREGROUND           ?? "#1A1A2E",
    muted:               process.env.NEXT_PUBLIC_COLOR_MUTED                ?? "#F0FEFE",
    mutedForeground:     process.env.NEXT_PUBLIC_COLOR_MUTED_FOREGROUND     ?? "#6B7280",
    border:              process.env.NEXT_PUBLIC_COLOR_BORDER               ?? "#E5E7EB",
    radius:              process.env.NEXT_PUBLIC_BORDER_RADIUS              ?? "0.75rem",
  },
};
