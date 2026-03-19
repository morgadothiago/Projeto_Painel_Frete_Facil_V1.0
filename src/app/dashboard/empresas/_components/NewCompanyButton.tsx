"use client";

import { Plus } from "lucide-react";

export function NewCompanyButton() {
  return (
    <a
      href="/signup"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 18px",
        borderRadius: 10,
        background: "#0C6B64",
        color: "#ffffff",
        fontSize: 13.5,
        fontWeight: 600,
        textDecoration: "none",
        letterSpacing: "0.01em",
        boxShadow: "0 2px 8px rgba(12,107,100,0.28)",
        transition: "filter 0.15s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter    = "brightness(1.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter    = "brightness(1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onMouseDown={(e)  => { e.currentTarget.style.transform = "translateY(0) scale(0.97)"; }}
      onMouseUp={(e)    => { e.currentTarget.style.transform = "translateY(-1px)"; }}
    >
      <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
      Nova empresa
    </a>
  );
}
