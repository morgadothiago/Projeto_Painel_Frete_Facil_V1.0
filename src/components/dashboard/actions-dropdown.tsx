"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

export type DropdownItem = {
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  hoverBg:  string;
  onClick:  () => void;
  disabled?: boolean;
};

export type DangerItem = {
  label:    string;
  icon:     React.ReactNode;
  onClick:  () => void;
  disabled?: boolean;
};

export function ActionsDropdown({
  items,
  dangerItem,
  loading,
}: {
  items:       DropdownItem[];
  dangerItem?: DangerItem;
  loading?:    boolean;
}) {
  const [open, setOpen] = useState(false);
  const isDisabled = (d?: boolean) => d ?? loading ?? false;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 32, height: 32, borderRadius: 8,
          border: "none",
          background: open ? "#F1F5F9" : "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#0C6B64" : "#94A3B8",
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#0C6B64"; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; } }}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 4px)",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(0,0,0,0.10)",
            border: "1px solid #F1F5F9",
            zIndex: 20, minWidth: 180, padding: 6,
          }}>
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { item.onClick(); setOpen(false); }}
                disabled={isDisabled(item.disabled)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "8px 11px",
                  border: "none", background: "transparent",
                  fontSize: 13, fontWeight: 500, color: item.color,
                  cursor: isDisabled(item.disabled) ? "not-allowed" : "pointer",
                  borderRadius: 8, textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!isDisabled(item.disabled)) e.currentTarget.style.background = item.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            {dangerItem && (
              <>
                <div style={{ height: 1, background: "#E2E8F0", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={() => { dangerItem.onClick(); setOpen(false); }}
                  disabled={isDisabled(dangerItem.disabled)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    width: "100%", padding: "8px 11px",
                    border: "none", background: "transparent",
                    fontSize: 13, fontWeight: 500, color: "#DC2626",
                    cursor: isDisabled(dangerItem.disabled) ? "not-allowed" : "pointer",
                    borderRadius: 8, textAlign: "left",
                  }}
                  onMouseEnter={(e) => { if (!isDisabled(dangerItem.disabled)) e.currentTarget.style.background = "#FEF2F2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {dangerItem.icon}
                  {dangerItem.label}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
