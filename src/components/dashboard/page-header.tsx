import { Plus } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  label?: string;
  actionLabel?: string;
  actionHref?: string;
  showTruck?: boolean;
};

export function PageHeader({ title, subtitle, label, actionLabel, actionHref, showTruck = true }: PageHeaderProps) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0C6B64_0%,#2EC4B6_100%)] px-6 py-5 shadow-[0_6px_24px_rgba(46,196,182,0.28)]">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-10 right-44 h-44 w-44 rounded-full bg-white/[0.07]" />
      <div className="pointer-events-none absolute -bottom-8 right-12 h-36 w-36 rounded-full bg-white/[0.06]" />

      <div className="relative z-[1] flex items-center justify-between gap-4">
        {/* Text */}
        <div>
          {label && (
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/70">
              {label}
            </p>
          )}
          <h1 className="m-0 text-[22px] font-extrabold leading-[1.2] tracking-[-0.3px] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="m-0 mt-1 text-[13px] text-white/80">{subtitle}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-4">
          {showTruck && (
            <svg
              viewBox="0 0 160 90"
              fill="none"
              className="hidden h-[54px] w-24 opacity-90 sm:block"
              aria-hidden
            >
              <rect x="8" y="22" width="84" height="44" rx="7" fill="rgba(255,255,255,0.28)" />
              <path d="M92 30h30l18 18v18H92V30z" fill="rgba(255,255,255,0.28)" />
              <rect x="16" y="28" width="34" height="20" rx="3" fill="rgba(255,255,255,0.5)" />
              <rect x="96" y="34" width="22" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="32" cy="68" r="11" fill="rgba(255,255,255,0.3)" />
              <circle cx="32" cy="68" r="5" fill="rgba(255,255,255,0.6)" />
              <circle cx="116" cy="68" r="11" fill="rgba(255,255,255,0.3)" />
              <circle cx="116" cy="68" r="5" fill="rgba(255,255,255,0.6)" />
              <rect x="0" y="79" width="160" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
            </svg>
          )}
          {actionLabel && actionHref && (
            <a
              href={actionHref}
              className="inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full bg-[#FFD54F] px-5 py-[10px] text-[13px] font-extrabold text-slate-800 no-underline shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-90"
            >
              <Plus className="h-[14px] w-[14px]" />
              <span className="hidden sm:inline">{actionLabel}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
