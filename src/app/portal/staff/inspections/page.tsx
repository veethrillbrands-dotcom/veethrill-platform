import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { Calendar, AlertTriangle, Clock } from "lucide-react";

export default async function StaffInspectionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const inspections = await db.inspection.findMany({
    where: { completedAt: null },
    include: { property: true, unit: true },
    orderBy: { scheduledAt: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = inspections.filter((i) => new Date(i.scheduledAt) < today);
  const dueToday = inspections.filter((i) => {
    const d = new Date(i.scheduledAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const upcoming = inspections.filter((i) => new Date(i.scheduledAt) > today);

  const TYPE_COLOR: Record<string, string> = {
    ROUTINE: "bg-blue-100 text-blue-700",
    MOVE_IN: "bg-emerald-100 text-emerald-700",
    MOVE_OUT: "bg-orange-100 text-orange-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-700",
    ANNUAL: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Pending Inspections" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Pending", value: inspections.length, icon: <Calendar size={14} />, color: "var(--navy)" },
            { label: "Due Today", value: dueToday.length, icon: <Clock size={14} />, color: "var(--gold)" },
            { label: "Overdue", value: overdue.length, icon: <AlertTriangle size={14} />, color: overdue.length > 0 ? "#EF4444" : "var(--emerald)" },
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

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-red-600" />
              <div className="text-[13px] font-bold text-red-700">{overdue.length} Overdue Inspection{overdue.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="space-y-2">
              {overdue.map((i) => (
                <div key={i.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5">
                  <div>
                    <div className="text-[12.5px] font-semibold text-gray-900">{i.property.name}{i.unit ? ` · Unit ${i.unit.unitNumber}` : ""}</div>
                    <div className="text-[11px] text-gray-500">{i.type} inspection</div>
                  </div>
                  <div className="text-[11.5px] font-bold text-red-600">{new Date(i.scheduledAt).toLocaleDateString("en-GB")}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">All Pending Inspections</div>
          {inspections.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-[15px] font-bold text-gray-700">No Pending Inspections</div>
              <div className="text-[12px] text-gray-400 mt-1">All inspections are up to date.</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {inspections.map((i) => {
                const isOverdue = new Date(i.scheduledAt) < today;
                const scheduledDate = new Date(i.scheduledAt);
                scheduledDate.setHours(0, 0, 0, 0);
                const isToday = scheduledDate.getTime() === today.getTime();
                return (
                  <div key={i.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900">{i.property.name}{i.unit ? ` · Unit ${i.unit.unitNumber}` : ""}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[i.type] ?? "bg-gray-100 text-gray-600"}`}>{i.type.replace("_", " ")}</span>
                        {i.inspectorId && <span className="text-[11px] text-gray-400">Inspector ID: {i.inspectorId}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className={`text-[12.5px] font-bold ${isOverdue ? "text-red-600" : isToday ? "text-orange-600" : "text-gray-700"}`}>
                          {new Date(i.scheduledAt).toLocaleDateString("en-GB")}
                        </div>
                        <div className="text-[10.5px] text-gray-400">{new Date(i.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">OVERDUE</span>}
                      {isToday && !isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">TODAY</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
