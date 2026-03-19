"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickAction({ icon, label, sub, href, color }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center gap-[13px] rounded-xl px-3 py-[11px] no-underline transition-colors duration-150",
        hovered ? "bg-background" : "bg-transparent"
      )}
    >
      <div
        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 transition-colors duration-150"
        style={{
          background: hovered ? `${color}22` : `${color}14`,
          color,
        }}
      >
        <span className="w-[17px] h-[17px] flex">{icon}</span>
      </div>

      <div className="flex-1">
        <p className="text-[13.5px] font-bold text-foreground m-0">{label}</p>
        <p className="text-xs text-muted-foreground m-0 mt-0.5">{sub}</p>
      </div>

      <ChevronRight
        className="shrink-0 w-[15px] h-[15px] transition-colors duration-150"
        style={{ color: hovered ? color : undefined }}
        color={hovered ? color : undefined}
      />
    </a>
  );
}
