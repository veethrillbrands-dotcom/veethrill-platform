import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-blue-100 text-blue-700", ROUTINE: "bg-gray-100 text-gray-600",
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700", ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700", COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default async function StaffPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const [workOrders, inspections] = await Promise.all([
    db.workOrder.findMany({
      where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
      include: { property: true, unit: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    }),
    db.inspection.findMany({
      where: { completedAt: null },
      include: { property: true, unit: true },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
  ]);

  const urgent = workOrders.filter((w) => w.priority === "URGENT" || w.priority === "HIGH").length;
  const today = new Date(); today.setHours(0,0,0,0);
  const overdueInspections = inspections.filter((i) => new Date(i.scheduledAt) < today).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Staff Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome back</div>
          <div className="text-[22px] font-black mt-0.5">{user.firstName} {user.lastName}</div>
          <div className="text-[13px] text-white/60 mt-1">Maintenance Staff · Veethrill Realty</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open Jobs", value: workOrders.length, icon: <Wrench size={15} />, color: "var(--gold)" },
            { label: "Urgent / High", value: urgent, icon: <AlertTriangle size={15} />, color: "#EF4444" },
            { label: "Inspections Due", value: inspections.length, icon: <Clock size={15} />, color: "#3B82F6" },
            { label: "Overdue", value: overdueInspections, icon: <CheckCircle size={15} />, color: overdueInspections > 0 ? "#EF4444" : "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[16px] font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Work Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Open Work Orders</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Job", "Property · Unit", "Category", "Priority", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workOrders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-[13px]">No open work orders.</td></tr>
                ) : workOrders.map((w) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 max-w-[180px] truncate">{w.title}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-600">{w.property.name}{w.unit ? ` · Unit ${w.unit.unitNumber}` : ""}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-600">{w.category}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[w.priority] ?? "bg-gray-100"}`}>{w.priority}</span></td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[w.status] ?? "bg-gray-100"}`}>{w.status.replace("_"," ")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspections */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Pending Inspections</div>
          <div className="divide-y divide-gray-50">
            {inspections.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-[13px]">No pending inspections.</div>
            ) : inspections.map((i) => {
              const overdue = new Date(i.scheduledAt) < today;
              return (
                <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{i.property.name}{i.unit ? ` · Unit ${i.unit.unitNumber}` : ""}</div>
                    <div className="text-[11.5px] text-gray-400">{i.type} inspection</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] text-gray-600">{new Date(i.scheduledAt).toLocaleDateString("en-GB")}</div>
                    {overdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">OVERDUE</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
