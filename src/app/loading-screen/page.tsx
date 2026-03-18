import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { LoadingClient } from "./_components/LoadingClient";

export default async function LoadingScreenPage() {
  const session = await auth();
  if (!session) redirect("/");

  const role = (session.user as { role?: string }).role ?? "COMPANY";
  return <LoadingClient role={role as "ADMIN" | "COMPANY" | "DRIVER"} />;
}
