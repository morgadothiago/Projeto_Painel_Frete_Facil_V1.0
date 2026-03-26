import { auth }     from "@/auth";
import { redirect } from "next/navigation";

import { AdminDashboard }   from "./_views/AdminDashboard";
import { CompanyDashboard } from "./_views/CompanyDashboard";
import { DriverDashboard }  from "./_views/DriverDashboard";
import { getPendingPayment, type PendingPayment } from "@/app/actions/billing";
import { getCompanyDashboardStats, getDriverDashboardStats } from "@/app/actions/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const { user } = session;
  const firstName = user.name?.split(" ")[0] ?? "usuário";
  const role      = user.role ?? "COMPANY";

  if (role === "ADMIN")   return <AdminDashboard   userName={firstName} />;
  if (role === "DRIVER") {
    const stats = await getDriverDashboardStats();
    return <DriverDashboard userName={firstName} stats={stats} />;
  }

  const [pendingPayment, stats] = await Promise.all([
    getPendingPayment(),
    getCompanyDashboardStats(),
  ]);
  return <CompanyDashboard userName={firstName} pendingPayment={pendingPayment} stats={stats} />;
}
