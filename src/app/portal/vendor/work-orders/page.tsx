import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { VendorWorkOrdersClient } from "../VendorWorkOrdersClient";
import { Wrench, CheckCircle, Clock } from "lucide-react";

export default async function VendorWorkOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId }, include: { vendor: true } });
  if (!user) redirect("/sign-in");

  const workOrders = user.vendor
    ? await db.workOrder.findMany({
        where: { vendor: { userId: user.id } },
        include: { property: true, unit: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const completed = workOrders.filter((w) => w.status === "COMPLETED").length;
  const open = workOrders.filter((w) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(w.status)).length;

  const serialized = workOrders.map((o) => ({
    ...o,
    raisedAt: o.raisedAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    assignedAt: o.assignedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    property: { name: o.property.name },
    unit: o.unit ? { unitNumber: o.unit.unitNumber } : null,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Work Orders" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open Jobs", value: open, icon: <Wrench size={14} />, color: "var(--gold)" },
            { label: "Completed", value: completed, icon: <CheckCircle size={14} />, color: "var(--emerald)" },
            { label: "Total", value: workOrders.length, icon: <Clock size={14} />, color: "var(--navy)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <VendorWorkOrdersClient orders={serialized} />

      </div>
    </div>
  );
}
