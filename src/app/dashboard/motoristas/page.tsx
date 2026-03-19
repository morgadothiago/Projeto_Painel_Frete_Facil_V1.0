import { redirect }      from "next/navigation";
import { auth }          from "@/auth";
import { Users }         from "lucide-react";
import { db }            from "@/lib/db";
import { getDrivers, getAllDrivers } from "@/app/actions/drivers";
import { DriversTable }  from "./_components/DriversTable";
import { NewDriverButton } from "./_components/NewDriverButton";

export default async function MotoristasPage() {
  const session = await auth();
  if (!session) redirect("/");

  const role = session.user.role;
  let drivers;
  let companyId = session.user.company?.id;

  if (!companyId && role === "COMPANY") {
    const company = await db.company.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });
    companyId = company?.id;
  }

  if (role === "ADMIN") {
    drivers = await getAllDrivers();
  } else {
    if (!companyId) {
      return (
        <div className="flex h-full min-h-0 flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#8B5CF6,#A78BFA)] shadow-[0_4px_16px_rgba(139,92,246,0.35)]">
              <Users className="h-[20px] w-[20px] text-white" />
            </div>
            <div>
              <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">Motoristas</h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">Empresa não encontrada. Entre em contato com o suporte.</p>
          </div>
        </div>
      );
    }
    drivers = await getDrivers(companyId);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">

      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#8B5CF6,#A78BFA)] shadow-[0_4px_16px_rgba(139,92,246,0.35)]">
            <Users className="h-[20px] w-[20px] text-white" />
          </div>
          <div>
            <h1 className="m-0 text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-slate-900">
              {role === "ADMIN" ? "Todos os Motoristas" : "Motoristas"}
            </h1>
            <p className="m-0 mt-0.5 text-[13px] text-muted-foreground">
              {role === "ADMIN" ? "Gerencie todos os motoristas da plataforma" : "Gerencie os motoristas da sua empresa"}
            </p>
          </div>
        </div>
        {role !== "ADMIN" && <NewDriverButton />}
      </div>

      <DriversTable initialData={drivers} userRole={role} />
    </div>
  );
}