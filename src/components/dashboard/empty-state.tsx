import { Plus } from "lucide-react";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({ icon, title, subtitle, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-9 text-center">
      <div className="mb-[18px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-light">
        {icon}
      </div>
      <p className="m-0 mb-1.5 text-[15px] font-bold tracking-[-0.2px] text-slate-900">{title}</p>
      <p className="m-0 mb-6 text-[13px] leading-[1.6] text-muted-foreground">{subtitle}</p>
      <a
        href={actionHref}
        className="inline-flex items-center gap-[7px] rounded-full bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] px-[26px] py-[11px] text-[13.5px] font-bold text-white no-underline shadow-[0_6px_18px_rgba(46,196,182,0.35)] transition-opacity hover:opacity-90"
      >
        <Plus className="h-[14px] w-[14px]" />
        {actionLabel}
      </a>
    </div>
  );
}
