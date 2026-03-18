"use client";

import { useState, useId, type ReactNode, type InputHTMLAttributes } from "react";
import { tenantConfig } from "@/config/tenant";

const { theme: t } = tenantConfig;

// ── Types ─────────────────────────────────────────────────────────────────────

type InputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className" | "style"
> & {
  label:         string;
  error?:        string;
  helper?:       string;
  leftIcon?:     ReactNode;
  rightElement?: ReactNode;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function InputField({
  label,
  error,
  helper,
  leftIcon,
  rightElement,
  ...inputProps
}: InputFieldProps) {
  const id                    = useId();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasError              = Boolean(error);

  /* ── Tokens de estado ── */
  const borderColor = hasError
    ? t.error
    : focused
    ? t.primary
    : hovered
    ? "#C8D0DA"
    : "#DDE3EC";

  const bgColor = focused ? "#FFFFFF" : "#F7F9FC";

  const ringColor = hasError
    ? `${t.error}18`
    : focused
    ? `${t.primary}16`
    : "transparent";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>

      {/* ── Label ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          htmlFor={id}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: hasError ? t.error : focused ? t.primary : t.textPrimary,
            letterSpacing: "0.01em",
            cursor: "pointer",
            transition: "color 0.18s",
            userSelect: "none",
          }}
        >
          {label}
          {inputProps.required && (
            <span style={{ color: t.error, marginLeft: 3 }}>*</span>
          )}
        </label>

        {/* Slot para link opcional (ex: "Esqueceu?") */}
        {hasError && (
          <span style={{
            fontSize: 11.5, fontWeight: 600,
            color: t.error, letterSpacing: "0.01em",
          }}>
            {error}
          </span>
        )}
      </div>

      {/* ── Wrapper ── */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          height: 48,
          borderRadius: 12,
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          boxShadow: focused || hasError
            ? `0 0 0 4px ${ringColor}, 0 1px 2px rgba(0,0,0,0.04)`
            : "0 1px 2px rgba(0,0,0,0.04)",
          transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s",
          overflow: "hidden",
          cursor: "text",
        }}
        onClick={() => document.getElementById(id)?.focus()}
      >
        {/* Left icon */}
        {leftIcon && (
          <span style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            flexShrink: 0,
            color: hasError
              ? t.error
              : focused
              ? t.primary
              : "#9CA8B8",
            transition: "color 0.18s",
          }}>
            {leftIcon}
          </span>
        )}

        {/* Divisor icon/input */}
        {leftIcon && (
          <div style={{
            width: 1,
            height: 22,
            background: focused ? `${t.primary}30` : "#E8EDF2",
            flexShrink: 0,
            transition: "background 0.18s",
          }} />
        )}

        {/* Input */}
        <input
          id={id}
          {...inputProps}
          onFocus={(e) => { setFocused(true);  inputProps.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); inputProps.onBlur?.(e);  }}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            padding: leftIcon ? "0 14px 0 14px" : "0 14px",
            paddingRight: rightElement ? 8 : 14,
            fontSize: 14,
            fontWeight: 450,
            border: "none",
            outline: "none",
            background: "transparent",
            color: t.textPrimary,
            letterSpacing: "0.01em",
          }}
        />

        {/* Right element */}
        {rightElement && (
          <span style={{
            paddingRight: 10,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}>
            {rightElement}
          </span>
        )}
      </div>

      {/* Helper (só quando não há erro — erro vai inline no label) */}
      {helper && !error && (
        <p style={{
          margin: 0,
          fontSize: 12,
          color: t.textSecondary,
          paddingLeft: 2,
          lineHeight: 1.5,
        }}>
          {helper}
        </p>
      )}
    </div>
  );
}
