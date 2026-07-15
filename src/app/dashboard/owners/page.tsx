import { OwnersTopbar, OwnerRowActions } from "./OwnersClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, TrendingUp, Building2, DollarSign } from "lucide-react";
import { getInitials } from "@/lib/utils";

async function getOwners() {
  return db.owner.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
}

export default async function OwnersPage() {
  const owners = await getOwners();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <OwnersTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Owners", value: owners.length, icon: <Briefcase size={16} />, color: "var(--navy)" },
            { label: "Units Under Mgmt", value: "—", icon: <Building2 size={16} />, color: "var(--emerald)" },
            { label: "Gross Revenue", value: "—", icon: <DollarSign size={16} />, color: "var(--gold)" },
            { label: "Total NOI", value: "—", icon: <TrendingUp size={16} />, color: "#3B82F6" },
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

        {owners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🏡</div>
            <div className="text-[16px] font-bold text-gray-900 mb-1">No owners registered yet</div>
            <div className="text-[13px] text-gray-400">Click "Add Owner" to register a property owner.</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {owners.map((owner) => (
              <div key={owner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)", color: "var(--gold)" }}>
                      {getInitials(`${owner.user.firstName} ${owner.user.lastName}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-gray-900">{owner.user.firstName} {owner.user.lastName}</div>
                      <div className="text-[11.5px] text-gray-400 truncate">{owner.user.email}</div>
                      <div className="text-[11px] text-gray-400">{owner.user.phone ?? "No phone"}</div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {owner.bankName && (
                    <div className="bg-blue-50 rounded-xl p-3 text-[12px] text-blue-700">
                      <strong>{owner.bankName}</strong><br />
                      {owner.bankAccountName && <span>{owner.bankAccountName} · </span>}
                      {owner.bankAccountNumber}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <OwnerRowActions owner={owner} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle sub="Upcoming owner payments">Remittance Schedule</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Process All</button>
          </CardHeader>
          <CardBody noPad>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Owner", "Bank", "Due Date", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8 text-[13px]">No owners to schedule remittances for.</td></tr>
                ) : owners.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{o.user.firstName} {o.user.lastName}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{o.bankName ?? "—"} {o.bankAccountNumber ? `· ${o.bankAccountNumber}` : ""}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">Jul 25, 2026</td>
                    <td className="px-4 py-3"><Badge variant="warning">PENDING</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
