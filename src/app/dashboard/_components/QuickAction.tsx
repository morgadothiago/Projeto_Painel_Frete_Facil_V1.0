"use client";

import { ChevronRight } from "lucide-react";

export function QuickAction({ icon, label, sub, href, color }: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-[13px] rounded-xl px-3 py-[11px] no-underline transition-colors duration-150 hover:bg-background"
    >
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] transition-colors duration-150"
        style={{ background: `${color}14`, color }}
      >
        <span className="flex h-[17px] w-[17px]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[13.5px] font-bold text-slate-900">{label}</p>
        <p className="m-0 mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <ChevronRight className="h-[15px] w-[15px] shrink-0 text-muted-foreground/40 transition-colors duration-150 group-hover:text-primary" />
    </a>
  );
}
