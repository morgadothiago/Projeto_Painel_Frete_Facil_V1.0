import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  fill?: boolean;
};

export function Card({ children, title, icon, href, hrefLabel = "Ver todos", fill }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)]",
        fill && "min-h-0 flex-1"
      )}
    >
      {title && (
        <div className="flex shrink-0 items-center justify-between border-b border-background px-[22px] py-[18px]">
          <div className="flex items-center gap-[9px]">
            {icon && <span className="flex text-primary">{icon}</span>}
            <span className="text-[14.5px] font-bold tracking-[-0.2px] text-slate-900">{title}</span>
          </div>
          {href && (
            <a
              href={href}
              className="flex items-center gap-1 text-[12.5px] font-semibold text-primary no-underline opacity-80 transition-opacity hover:opacity-100"
            >
              {hrefLabel}
              <ArrowUpRight className="h-[13px] w-[13px]" />
            </a>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
