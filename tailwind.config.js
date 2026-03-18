/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        border: "var(--color-border)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
      },
      borderRadius: {
        theme: "var(--radius)",
        pill: "9999px",
        card: "var(--radius-card)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 2px 16px rgba(0, 201, 181, 0.10), 0 1px 4px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px rgba(0, 201, 181, 0.18), 0 2px 8px rgba(0,0,0,0.08)",
        soft: "0 2px 12px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-background) 60%)",
      },
    },
  },
  plugins: [],
};
