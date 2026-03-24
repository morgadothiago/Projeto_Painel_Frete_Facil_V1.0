import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { LoadingClient } from "./_components/LoadingClient";
import { isCompanyProfileComplete } from "@/app/actions/companies";
import { checkCompanyAccess } from "@/app/actions/billing";

export default async function LoadingScreenPage() {
  const session = await auth();
  if (!session) redirect("/");

  const role = (session.user as { role?: string }).role ?? "COMPANY";
  const companyId = (session.user as any).company?.id;

  console.log("[LoadingScreen] role:", role, "companyId:", companyId);

  let profileComplete = true;
  let accessDenied = false;
  let denyReason = "";

  if (role === "COMPANY") {
    const access = await checkCompanyAccess();
    console.log("[LoadingScreen] access result:", JSON.stringify(access));

    if (!access.allowed) {
      accessDenied = true;
      denyReason = access.reason ?? "BLOCKED";
    } else {
      profileComplete = await isCompanyProfileComplete();
    }
  }

  console.log("[LoadingScreen] accessDenied:", accessDenied, "denyReason:", denyReason);

  return (
    <LoadingClient
      role={role as "ADMIN" | "COMPANY" | "DRIVER"}
      profileComplete={profileComplete}
      accessDenied={accessDenied}
      denyReason={denyReason}
    />
  );
}
