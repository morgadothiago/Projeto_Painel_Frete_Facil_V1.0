import { redirect }              from "next/navigation";
import { auth }                  from "@/auth";
import { Wallet }                from "lucide-react";
import { getCompanyPayments, getCompanyPaymentStats } from "@/app/actions/payments";
import { FinanceiroClient }      from "./_components/FinanceiroClient";

export default async function FinanceiroPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "COMPANY" && role !== "ADMIN") redirect("/dashboard");

  const [payments, stats] = await Promise.all([
    getCompanyPayments(),
    getCompanyPaymentStats(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#0C6B64,#2EC4B6)] shadow-[0_4px_16px_rgba(46,196,182,0.35)]">
          <Wallet className="h-[20px] w-[20px] text-white" />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
            Financeiro
          </h1>
          <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
            Histórico de mensalidades e situação financeira
          </p>
        </div>
      </div>

      <FinanceiroClient initialPayments={payments} initialStats={stats} />
    </div>
  );
}
