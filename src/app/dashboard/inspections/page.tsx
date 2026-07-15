import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const INSPECTIONS = [
  { id: "INS-001", property: "Veethrill Towers", unit: "Unit 7C", type: "Move-in", scheduledAt: "2025-08-01", completedAt: "2025-08-01", inspector: "Amara Okonkwo", status: "COMPLETED", findings: "Property in excellent condition. All appliances functional.", rating: 9.2 },
  { id: "INS-002", property: "Veethrill Towers", unit: "Unit 4B", type: "Maintenance", scheduledAt: "2026-07-14", completedAt: "2026-07-14", inspector: "Amara Okonkwo", status: "COMPLETED", findings: "AC unit confirmed non-functional. Compressor failure. Vendor assigned.", rating: 4.1 },
  { id: "INS-003", property: "Lekki Gardens Phase 3", unit: "Block A-1", type: "Routine", scheduledAt: "2026-07-20", completedAt: null, inspector: "Amara Okonkwo", status: "SCHEDULED", findings: null, rating: null },
  { id: "INS-004", property: "Ikoyi Residences", unit: "Villa A", type: "Move-in", scheduledAt: "2025-12-01", completedAt: "2025-12-01", inspector: "Amara Okonkwo", status: "COMPLETED", findings: "Luxury villa in perfect condition. Pool and all smart home systems working.", rating: 9.8 },
  { id: "INS-005", property: "Lekki Shortlet Suites", unit: "Suite 1A", type: "Turnover", scheduledAt: "2026-07-18", completedAt: null, inspector: "Amara Okonkwo", status: "SCHEDULED", findings: null, rating: null },
  { id: "INS-006", property: "Abuja Heights", unit: "PH 1", type: "Move-in", scheduledAt: "2025-12-01", completedAt: "2025-12-01", inspector: "Amara Okonkwo", status: "COMPLETED", findings: "Penthouse in excellent state. Minor scuff on main door frame — noted.", rating: 9.0 },
  { id: "INS-007", property: "Port Harcourt Business Park", unit: "Full Property", type: "Annual", scheduledAt: "2026-07-30", completedAt: null, inspector: null, status: "PENDING", findings: null, rating: null },
];

const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default"> = {
  COMPLETED: "success", SCHEDULED: "info", PENDING: "warning",
};

const TYPE_COLORS: Record<string, string> = {
  "Move-in": "bg-blue-100 text-blue-700",
  "Routine": "bg-purple-100 text-purple-700",
  "Maintenance": "bg-red-100 text-red-700",
  "Turnover": "bg-yellow-100 text-yellow-700",
  "Annual": "bg-emerald-100 text-emerald-700",
};

export default function InspectionsPage() {
  const completed = INSPECTIONS.filter((i) => i.status === "COMPLETED").length;
  const scheduled = INSPECTIONS.filter((i) => i.status === "SCHEDULED").length;
  const avgRating = (INSPECTIONS.filter((i) => i.rating).reduce((s, i) => s + (i.rating ?? 0), 0) / completed).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Inspections" action={{ label: "Schedule Inspection" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Inspections", value: INSPECTIONS.length, icon: <Search size={16} />, color: "var(--navy)" },
            { label: "Completed", value: completed, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Scheduled", value: scheduled, icon: <Calendar size={16} />, color: "#3B82F6" },
            { label: "Avg Rating", value: `${avgRating}/10`, icon: <AlertTriangle size={16} />, color: "var(--gold)" },
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

        {/* Upcoming Inspections */}
        <div className="grid grid-cols-3 gap-4">
          {INSPECTIONS.filter((i) => i.status !== "COMPLETED").map((insp) => (
            <div key={insp.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[13px] font-bold text-gray-900">{insp.property}</div>
                  <div className="text-[11.5px] text-gray-400">{insp.unit}</div>
                </div>
                <Badge variant={STATUS_BADGE[insp.status] ?? "default"}>{insp.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[insp.type] ?? "bg-gray-100 text-gray-600"}`}>{insp.type}</span>
              </div>
              <div className="space-y-1.5 text-[12px] text-gray-600">
                <div className="flex items-center gap-1.5"><Calendar size={11} className="text-gray-400" /> Scheduled: <strong>{insp.scheduledAt}</strong></div>
                <div className="flex items-center gap-1.5"><Clock size={11} className="text-gray-400" /> Inspector: {insp.inspector ?? "Not assigned"}</div>
              </div>
              <button className="w-full mt-3 py-2 rounded-xl text-[11.5px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Start Inspection →
              </button>
            </div>
          ))}
        </div>

        {/* All Inspections Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${INSPECTIONS.length} total inspections`}>Inspection Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["ID", "Property · Unit", "Type", "Scheduled", "Completed", "Inspector", "Rating", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INSPECTIONS.map((insp) => (
                    <tr key={insp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5 text-[11.5px] font-mono text-gray-500">{insp.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">{insp.property}</div>
                        <div className="text-[11px] text-gray-400">{insp.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[insp.type] ?? "bg-gray-100 text-gray-600"}`}>{insp.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{insp.scheduledAt}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{insp.completedAt ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-700">{insp.inspector ?? "—"}</td>
                      <td className="px-4 py-3">
                        {insp.rating ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${insp.rating * 10}%`, background: insp.rating >= 8 ? "var(--emerald)" : insp.rating >= 6 ? "var(--gold)" : "#EF4444" }} />
                            </div>
                            <span className="text-[12px] font-bold text-gray-900">{insp.rating}</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[insp.status] ?? "default"}>{insp.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
