import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, TrendingUp, Building2, DollarSign } from "lucide-react";
import { getInitials } from "@/lib/utils";

async function getOwners() {
  return db.owner.findMany({ include: { user: true } });
}

// Static owner portfolio data (would be from DB in production)
const OWNER_PORTFOLIOS = [
  {
    name: "Chief Emeka Eze", email: "c.eze@ezegroup.ng", phone: "+234 803 111 2222",
    properties: ["Veethrill Towers", "Ikoyi Residences"], units: 7, monthlyIncome: 2190000,
    noi: 1840000, bank: "GTBank", occupancy: 71, joined: "Jan 2024",
  },
  {
    name: "Mrs. Bola Adeyemi", email: "bola.adeyemi@outlook.com", phone: "+234 807 333 4444",
    properties: ["Lekki Gardens Phase 3"], units: 3, monthlyIncome: 1210000,
    noi: 1080000, bank: "Zenith Bank", occupancy: 67, joined: "Jun 2024",
  },
  {
    name: "Alhaji Musa Ibrahim", email: "musa.ibrahim@abuja.com", phone: "+234 816 555 6666",
    properties: ["Abuja Heights", "Wuse II Plaza"], units: 3, monthlyIncome: 1460000,
    noi: 1210000, bank: "First Bank", occupancy: 50, joined: "Aug 2023",
  },
];

export default async function OwnersPage() {
  const dbOwners = await getOwners();
  const allOwners = [...OWNER_PORTFOLIOS]; // merge with DB owners

  const totalManagedRevenue = allOwners.reduce((s, o) => s + o.monthlyIncome, 0);
  const totalNOI = allOwners.reduce((s, o) => s + o.noi, 0);
  const totalUnits = allOwners.reduce((s, o) => s + o.units, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Owner Portal" action={{ label: "Add Owner" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Owners", value: allOwners.length, icon: <Briefcase size={16} />, color: "var(--navy)" },
            { label: "Units Under Mgmt", value: totalUnits, icon: <Building2 size={16} />, color: "var(--emerald)" },
            { label: "Gross Revenue", value: formatCurrency(totalManagedRevenue), icon: <DollarSign size={16} />, color: "var(--gold)" },
            { label: "Total NOI", value: formatCurrency(totalNOI), icon: <TrendingUp size={16} />, color: "#3B82F6" },
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

        {/* Owner Cards */}
        <div className="grid grid-cols-3 gap-4">
          {allOwners.map((owner) => (
            <div key={owner.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)", color: "var(--gold)" }}>
                    {getInitials(owner.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-gray-900">{owner.name}</div>
                    <div className="text-[11.5px] text-gray-400 truncate">{owner.email}</div>
                    <div className="text-[11px] text-gray-400">{owner.phone}</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Properties</div>
                  <div className="flex flex-wrap gap-1">
                    {owner.properties.map((p) => (
                      <span key={p} className="text-[10.5px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Units", value: owner.units },
                    { label: "Occupancy", value: `${owner.occupancy}%` },
                    { label: "Since", value: owner.joined },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-gray-50 rounded-xl p-2">
                      <div className="text-[13px] font-black text-gray-900">{s.value}</div>
                      <div className="text-[9.5px] text-gray-400 font-semibold uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-gray-500">Monthly Revenue</span>
                    <span className="text-[13px] font-bold text-gray-900">{formatCurrency(owner.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-gray-500">Net Operating Income</span>
                    <span className="text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(owner.noi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-gray-500">Mgmt Fee (6%)</span>
                    <span className="text-[13px] font-bold text-red-500">({formatCurrency(owner.monthlyIncome * 0.06)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-gray-500">Bank</span>
                    <span className="text-[12px] font-semibold text-gray-700">{owner.bank}</span>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl text-[12px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  View Statement →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Remittance Schedule */}
        <Card>
          <CardHeader>
            <CardTitle sub="Upcoming owner payments">Remittance Schedule</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Process All</button>
          </CardHeader>
          <CardBody noPad>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Owner", "Properties", "Gross Revenue", "Mgmt Fee", "Net Remittance", "Due Date", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOwners.map((o) => {
                  const fee = o.monthlyIncome * 0.06;
                  const net = o.monthlyIncome - fee;
                  return (
                    <tr key={o.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 pl-5 text-[13px] font-semibold text-gray-900">{o.name}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{o.properties.length} properties</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-gray-900">{formatCurrency(o.monthlyIncome)}</td>
                      <td className="px-4 py-3 text-[12px] text-red-500">({formatCurrency(fee)})</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(net)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">Jul 25, 2026</td>
                      <td className="px-4 py-3"><Badge variant="warning">PENDING</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
