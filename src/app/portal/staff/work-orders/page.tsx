import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { Wrench, AlertTriangle } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-blue-100 text-blue-700",
  ROUTINE: "bg-gray-100 text-gray-600",
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function StaffWorkOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const workOrders = await db.workOrder.findMany({
    where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
    include: { property: true, unit: true },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  const urgent = workOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length;
  const inProgress = workOrders.filter((w) => w.status === "IN_PROGRESS").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Work Orders" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open Jobs", value: workOrders.length, icon: <Wrench size={14} />, color: "var(--navy)" },
            { label: "In Progress", value: inProgress, icon: <Wrench size={14} />, color: "#3B82F6" },
            { label: "Urgent / High", value: urgent, icon: <AlertTriangle size={14} />, color: "#EF4444" },
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Open Work Orders</div>
          {workOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-[15px] font-bold text-gray-700">All Clear!</div>
              <div className="text-[12px] text-gray-400 mt-1">No open work orders at the moment.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Job", "Property · Unit", "Category", "Priority", "Status", "Raised"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((w) => (
                    <tr key={w.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 max-w-[160px] truncate">{w.title}</td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{w.property.name}{w.unit ? ` · Unit ${w.unit.unitNumber}` : ""}</td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{w.category}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[w.priority] ?? "bg-gray-100"}`}>{w.priority}</span></td>
                      <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[w.status] ?? "bg-gray-100"}`}>{w.status.replace("_", " ")}</span></td>
                      <td className="px-5 py-3 text-[11.5px] text-gray-400">{new Date(w.raisedAt).toLocaleDateString("en-GB")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
