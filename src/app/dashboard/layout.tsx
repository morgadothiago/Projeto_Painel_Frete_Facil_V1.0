import { redirect }       from "next/navigation";
import { Suspense }        from "react";
import { auth }            from "@/auth";
import { DashboardShell }  from "@/components/layout/DashboardShell";
import { WelcomeToast }    from "@/components/layout/WelcomeToast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const name     = session.user.name ?? session.user.email ?? "?";
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <DashboardShell user={session.user} initials={initials}>
      <Suspense>
        <WelcomeToast userName={name} />
      </Suspense>
      {children}
    </DashboardShell>
  );
}
