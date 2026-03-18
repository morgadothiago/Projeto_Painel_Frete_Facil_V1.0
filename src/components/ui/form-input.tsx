"use client";

import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

type FormInputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

export function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: FormInputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{
        fontSize: 13, fontWeight: 600, color: t.textPrimary,
        letterSpacing: "0.01em",
      }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 14,
          border: `1.5px solid ${t.border}`,
          borderRadius: t.radiusMd,
          outline: "none",
          background: "#FFFFFF",
          color: t.textPrimary,
          transition: "border-color 0.18s, box-shadow 0.18s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = t.primary;
          e.currentTarget.style.boxShadow  = `0 0 0 3px ${t.primary}18`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = t.border;
          e.currentTarget.style.boxShadow   = "none";
        }}
      />
    </div>
  );
}
