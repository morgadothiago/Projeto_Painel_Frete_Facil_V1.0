import { ChevronRight } from "lucide-react";

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
};

export function InfoCard({ icon, title, description, linkLabel, linkHref }: InfoCardProps) {
  return (
    <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top accent bar */}
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[linear-gradient(90deg,#0C6B64,#2EC4B6)]" />

      <div className="flex items-start gap-[13px]">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-primary-light text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <p className="m-0 mb-[5px] text-[13.5px] font-bold text-slate-900">{title}</p>
          <p className="m-0 mb-[14px] text-[12.5px] leading-[1.6] text-muted-foreground">{description}</p>
          <a
            href={linkHref}
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-primary no-underline transition-opacity hover:opacity-80"
          >
            {linkLabel}
            <ChevronRight className="h-[13px] w-[13px]" />
          </a>
        </div>
      </div>
    </div>
  );
}
