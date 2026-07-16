import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { TenantMaintenanceClient } from "../TenantMaintenanceClient";

export default async function TenantMaintenancePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        include: {
          leases: {
            where: { status: "ACTIVE" },
            include: { unit: { include: { property: true } } },
            take: 1,
          },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  const tenant = user.tenant;
  const lease = tenant?.leases[0];

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Maintenance Requests" />
      <div className="flex-1 p-4 sm:p-6">
        <TenantMaintenanceClient
          tenantId={tenant?.id ?? ""}
          propertyId={lease?.unit.propertyId ?? ""}
          unitId={lease?.unitId ?? ""}
        />
      </div>
    </div>
  );
}
