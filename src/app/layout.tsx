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
    "--color-primary":              theme.primaryColor,
    "--color-primary-foreground":   theme.primaryForeground,
    "--color-primary-light":        theme.primaryLight,
    "--color-primary-dark":         theme.primaryDark,
    "--color-secondary":            theme.secondaryColor,
    "--color-secondary-foreground": theme.secondaryForeground,
    "--color-accent":               theme.accentColor,
    "--color-accent-foreground":    theme.accentForeground,
    "--color-background":           theme.background,
    "--color-foreground":           theme.foreground,
    "--color-muted":                theme.muted,
    "--color-muted-foreground":     theme.mutedForeground,
    "--color-border":               theme.border,
    "--radius":                     theme.radius,
    "--radius-card":                `calc(${theme.radius} + 0.25rem)`,
  } as React.CSSProperties;

  return (
    <html lang="pt-BR" style={cssVars}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
