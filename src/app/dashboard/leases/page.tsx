import { LeasesTopbar, LeasesTable } from "./LeasesClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

async function getLeases() {
  return db.lease.findMany({
    include: { unit: { include: { property: true } }, tenant: { include: { user: true } } },
    orderBy: { endDate: "asc" },
  });
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export default async function LeasesPage() {
  const leases = await getLeases();

  const active = leases.filter((l) => l.status === "ACTIVE").length;
  const expiringSoon = leases.filter((l) => l.status === "ACTIVE" && daysUntil(l.endDate) <= 60).length;
  const totalRentRoll = leases.filter((l) => l.status === "ACTIVE").reduce((s, l) => s + l.rentAmount, 0);

  const serializable = leases.map((l) => ({
    ...l,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <LeasesTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Leases", value: leases.length, icon: <FileText size={16} />, color: "var(--navy)" },
            { label: "Active", value: active, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Expiring (60d)", value: expiringSoon, icon: <AlertTriangle size={16} />, color: expiringSoon > 0 ? "#EF4444" : "var(--gold)" },
            { label: "Monthly Rent Roll", value: formatCurrency(totalRentRoll), icon: <Clock size={16} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[18px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub={`${leases.length} lease agreements — hover row for Renew / Terminate actions`}>Lease Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <LeasesTable leases={serializable as any} />
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
