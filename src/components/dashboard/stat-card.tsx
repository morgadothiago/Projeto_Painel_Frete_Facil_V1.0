type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
};

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)]">
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-white"
        style={{
          background: `linear-gradient(135deg,${accent}EE,${accent}99)`,
          boxShadow: `0 6px 16px ${accent}38`,
        }}
      >
        <span className="flex h-5 w-5">{icon}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="m-0 text-[28px] font-extrabold leading-none tracking-[-1px] text-slate-900">{value}</p>
        <p className="m-0 text-[13px] font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="m-0 text-[11.5px] font-semibold tracking-[0.02em]" style={{ color: accent }}>{sub}</p>
    </div>
  );
}
