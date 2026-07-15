import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockPayments, mockKPIs } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, AlertTriangle, TrendingUp } from "lucide-react";

const GATEWAYS = [
  { name: "Paystack", icon: "💳", color: "bg-emerald-100 text-emerald-700" },
  { name: "Flutterwave", icon: "💳", color: "bg-blue-100 text-blue-700" },
  { name: "Bank Transfer", icon: "🏦", color: "bg-yellow-100 text-yellow-700" },
  { name: "Mobile Money", icon: "📱", color: "bg-orange-100 text-orange-700" },
  { name: "Stripe (Intl)", icon: "💳", color: "bg-gray-100 text-gray-600" },
];

export default function PaymentsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Rent & Payments" action={{ label: "Record Payment" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Collected This Month" value={formatCurrency(mockKPIs.monthlyRevenue)} change={12.4} accentColor="var(--emerald)" icon={<TrendingUp size={18} style={{ color: "var(--emerald)" }} />} />
          <KPICard label="Overdue" value={formatCurrency(mockKPIs.overdueRent)} accentColor="#EF4444" icon={<AlertTriangle size={18} className="text-red-500" />} />
          <KPICard label="Collection Rate" value={`${mockKPIs.collectionRate}%`} change={1.8} accentColor="var(--gold)" />
          <KPICard label="Overdue Tenants" value="4" accentColor="#F97316" />
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Accepted Payment Methods</CardTitle>
          </CardHeader>
          <CardBody className="flex gap-3 flex-wrap">
            {GATEWAYS.map((g) => (
              <div key={g.name} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold ${g.color}`}>
                <span>{g.icon}</span> {g.name}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Payment Table */}
        <Card>
          <CardHeader>
            <CardTitle sub="All rent and payment transactions">Payment Ledger</CardTitle>
            <div className="flex gap-2">
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Statuses</option>
                <option>Paid</option>
                <option>Overdue</option>
                <option>Pending</option>
              </select>
              <button className="text-[11.5px] font-semibold text-gray-500 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-50">Export</button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Tenant", "Property / Unit", "Type", "Amount", "Method", "Reference", "Due Date", "Paid At", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0 transition-colors">
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{p.tenantName}</td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-gray-900">Unit {p.unitNumber}</div>
                      <div className="text-[11px] text-gray-400">{p.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{p.type}</td>
                    <td className="px-4 py-3 text-[12.5px] font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{p.method.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-[11.5px] text-gray-500 font-mono">{p.reference}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{formatDate(p.dueDate)}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{p.paidAt ? formatDate(p.paidAt) : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(p.status)}>{p.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>Receipt →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
