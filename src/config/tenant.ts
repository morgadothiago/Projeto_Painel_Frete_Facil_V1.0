export type TenantTheme = {
  // Brand
  primary:        string;
  primaryDark:    string;
  primaryLight:   string;
  secondary:      string;
  secondaryDark:  string;

  // Surfaces
  background:     string;
  surface:        string;

  // Text
  textPrimary:    string;
  textSecondary:  string;
  textInverse:    string;

  // Status
  success:        string;
  error:          string;
  warning:        string;

  // Borders
  border:         string;

  // Radius
  radiusSm:       string;
  radiusMd:       string;
  radiusLg:       string;
  radiusXl:       string;

  // Shadows
  shadowSm:       string;
  shadowMd:       string;
  shadowLg:       string;

  // Gradients
  gradientPrimary:    string;
  gradientBackground: string;
};

export type TenantConfig = {
  name:         string;
  shortName:    string;
  logoUrl:      string;
  faviconUrl:   string;
  supportEmail: string;
  supportPhone: string;
  theme:        TenantTheme;
};

export const tenantConfig: TenantConfig = {
  name:         process.env.NEXT_PUBLIC_BRAND_NAME       ?? "FreteFácil",
  shortName:    process.env.NEXT_PUBLIC_BRAND_SHORT      ?? "FF",
  logoUrl:      process.env.NEXT_PUBLIC_BRAND_LOGO       ?? "/logo.svg",
  faviconUrl:   process.env.NEXT_PUBLIC_BRAND_FAVICON    ?? "/favicon.ico",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL    ?? "suporte@fretefacil.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE    ?? "",

  theme: {
    primary:        process.env.NEXT_PUBLIC_COLOR_PRIMARY        ?? "#2EC4B6",
    primaryDark:    process.env.NEXT_PUBLIC_COLOR_PRIMARY_DARK   ?? "#1FA7A1",
    primaryLight:   process.env.NEXT_PUBLIC_COLOR_PRIMARY_LIGHT  ?? "#E6F7F6",
    secondary:      process.env.NEXT_PUBLIC_COLOR_SECONDARY      ?? "#FFD54F",
    secondaryDark:  process.env.NEXT_PUBLIC_COLOR_SECONDARY_DARK ?? "#FFC107",

    background:     process.env.NEXT_PUBLIC_COLOR_BG             ?? "#F5F7FA",
    surface:        process.env.NEXT_PUBLIC_COLOR_SURFACE        ?? "#FFFFFF",

    textPrimary:    process.env.NEXT_PUBLIC_COLOR_TEXT           ?? "#333333",
    textSecondary:  process.env.NEXT_PUBLIC_COLOR_TEXT_MUTED     ?? "#9E9E9E",
    textInverse:    process.env.NEXT_PUBLIC_COLOR_TEXT_INVERSE   ?? "#FFFFFF",

    success:        process.env.NEXT_PUBLIC_COLOR_SUCCESS        ?? "#4CAF50",
    error:          process.env.NEXT_PUBLIC_COLOR_ERROR          ?? "#F44336",
    warning:        process.env.NEXT_PUBLIC_COLOR_WARNING        ?? "#FF9800",

    border:         process.env.NEXT_PUBLIC_COLOR_BORDER         ?? "#E8EDF2",

    radiusSm:       "6px",
    radiusMd:       "12px",
    radiusLg:       "20px",
    radiusXl:       "30px",

    shadowSm:       "0 2px 4px rgba(0,0,0,0.05)",
    shadowMd:       "0 4px 10px rgba(0,0,0,0.08)",
    shadowLg:       "0 10px 25px rgba(0,0,0,0.12)",

    gradientPrimary:    "linear-gradient(135deg, #2EC4B6, #A8E6CF)",
    gradientBackground: "linear-gradient(180deg, #E6F7F6, #FFFFFF)",
  },
};
