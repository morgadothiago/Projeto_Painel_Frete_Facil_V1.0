import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { tenantConfig } from "@/config/tenant";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: tenantConfig.name,
  description: `Plataforma de gestão de entregas — ${tenantConfig.name}`,
  icons: { icon: tenantConfig.faviconUrl },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { theme } = tenantConfig;

  const cssVars = {
    "--color-primary":              theme.primary,
    "--color-primary-foreground":   theme.textInverse,
    "--color-primary-light":        theme.primaryLight,
    "--color-primary-dark":         theme.primaryDark,
    "--color-secondary":            theme.secondary,
    "--color-secondary-foreground": theme.textInverse,
    "--color-background":           theme.background,
    "--color-foreground":           theme.textPrimary,
    "--color-muted":                theme.background,
    "--color-muted-foreground":     theme.textSecondary,
    "--color-border":               theme.border,
    "--radius":                     theme.radiusMd,
    "--radius-card":                theme.radiusLg,
  } as React.CSSProperties;

  return (
    <html lang="pt-BR" style={cssVars}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
