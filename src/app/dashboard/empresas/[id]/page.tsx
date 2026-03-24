import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCompanyDetails, getCompanyPayments, getPaymentStats } from "@/app/actions/companies";
import { CompanyDetailsClient } from "./_components/CompanyDetailsClient";

export default async function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const { id } = await params;
  const role = session.user.role;

  // COMPANY só vê seus próprios dados
  const companyId = role === "COMPANY"
    ? (session.user as any).company?.id
    : id;

  if (!companyId) redirect("/dashboard/empresas");

  const [company, payments, stats] = await Promise.all([
    getCompanyDetails(companyId),
    getCompanyPayments(companyId),
    getPaymentStats(companyId),
  ]);

  if (!company) redirect("/dashboard/empresas");

  return (
    <CompanyDetailsClient
      company={company}
      payments={payments}
      stats={stats}
      isAdmin={role === "ADMIN"}
    />
  );
}
