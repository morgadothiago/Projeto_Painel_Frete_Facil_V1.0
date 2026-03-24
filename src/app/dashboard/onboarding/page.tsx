import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./_components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") redirect("/dashboard");

  const company = (session.user as any).company;
  return <OnboardingForm companyId={company?.id} />;
}
