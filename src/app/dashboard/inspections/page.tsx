import { InspectionsTopbar, InspectionCard, InspectionRowActions } from "./InspectionsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { Search, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

async function getInspections() {
  return db.inspection.findMany({
    include: { property: true, unit: true },
    orderBy: { scheduledAt: "desc" },
  });
}

const STATUS_BADGE: Record<string, "success" | "info" | "warning"> = {
  COMPLETED: "success", SCHEDULED: "info", PENDING: "warning",
};

const TYPE_COLORS: Record<string, string> = {
  "Move-in": "bg-blue-100 text-blue-700", "Move-out": "bg-orange-100 text-orange-700",
  "Routine": "bg-purple-100 text-purple-700", "Maintenance": "bg-red-100 text-red-700",
  "Turnover": "bg-yellow-100 text-yellow-700", "Annual": "bg-emerald-100 text-emerald-700",
  "Emergency": "bg-red-200 text-red-800",
};

function getStatus(insp: { completedAt: Date | string | null; scheduledAt: Date | string }) {
  if (insp.completedAt) return "COMPLETED";
  if (new Date(insp.scheduledAt) > new Date()) return "SCHEDULED";
  return "PENDING";
}

export default async function InspectionsPage() {
  const inspections = await getInspections();

  const serialized = inspections.map((i) => ({
    ...i,
    scheduledAt: i.scheduledAt.toISOString(),
    completedAt: i.completedAt?.toISOString() ?? null,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

  const completed = inspections.filter((i) => i.completedAt).length;
  const scheduled = inspections.filter((i) => !i.completedAt && new Date(i.scheduledAt) > new Date()).length;
  const ratings = inspections.filter((i) => i.rating != null).map((i) => i.rating as number);
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : "—";
  const upcoming = serialized.filter((i) => !i.completedAt);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <InspectionsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Inspections", value: inspections.length, icon: <Search size={16} />, color: "var(--navy)" },
            { label: "Completed", value: completed, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Upcoming", value: scheduled, icon: <Calendar size={16} />, color: "#3B82F6" },
            { label: "Avg Rating", value: avgRating === "—" ? "—" : `${avgRating}/10`, icon: <AlertTriangle size={16} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-3">Upcoming Inspections</h3>
            <div className="grid grid-cols-3 gap-4">
              {upcoming.slice(0, 6).map((insp) => (
                <InspectionCard key={insp.id} inspection={insp} />
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle sub={`${inspections.length} total inspections`}>Inspection Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Property · Unit", "Type", "Scheduled", "Completed", "Inspector", "Rating", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serialized.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-[13px]">No inspections yet. Click "Schedule Inspection" to add one.</td></tr>
                  ) : serialized.map((insp) => {
                    const status = getStatus(insp);
                    return (
                      <tr key={insp.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                        <td className="px-4 py-3 pl-5">
                          <div className="text-[13px] font-semibold text-gray-900">{insp.property.name}</div>
                          <div className="text-[11px] text-gray-400">{insp.unit?.unitNumber ?? "Full Property"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[insp.type] ?? "bg-gray-100 text-gray-600"}`}>{insp.type}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                          {new Date(insp.scheduledAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                          {insp.completedAt ? new Date(insp.completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-700">{insp.inspectorId ?? "—"}</td>
                        <td className="px-4 py-3">
                          {insp.rating ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{
                                  width: `${insp.rating * 10}%`,
                                  background: insp.rating >= 8 ? "var(--emerald)" : insp.rating >= 6 ? "var(--gold)" : "#EF4444"
                                }} />
                              </div>
                              <span className="text-[12px] font-bold text-gray-900">{insp.rating}</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[status] ?? "default"}>{status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <InspectionRowActions inspection={insp} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
