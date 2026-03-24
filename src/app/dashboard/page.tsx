import { auth }     from "@/auth";
import { redirect } from "next/navigation";

import { AdminDashboard }   from "./_views/AdminDashboard";
import { CompanyDashboard } from "./_views/CompanyDashboard";
import { DriverDashboard }  from "./_views/DriverDashboard";
import { getPendingPayment, type PendingPayment } from "@/app/actions/billing";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const { user } = session;
  const firstName = user.name?.split(" ")[0] ?? "usuário";
  const role      = user.role ?? "COMPANY";

  if (role === "ADMIN")   return <AdminDashboard   userName={firstName} />;
  if (role === "DRIVER")  return <DriverDashboard  userName={firstName} />;

  const pendingPayment = await getPendingPayment();
  return <CompanyDashboard userName={firstName} pendingPayment={pendingPayment} />;
}
