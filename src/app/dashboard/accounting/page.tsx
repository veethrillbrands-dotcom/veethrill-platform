import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency } from "@/lib/utils";
import { BookOpen } from "lucide-react";

const LEDGER = [
  { date: "2026-07-15", desc: "Rent Collection — Veethrill Towers", category: "Income", amount: 14800000, type: "credit" },
  { date: "2026-07-14", desc: "Generator Maintenance — Lekki Gardens", category: "Maintenance", amount: 65000, type: "debit" },
  { date: "2026-07-13", desc: "Rent Collection — Abuja Central Plaza", category: "Income", amount: 9600000, type: "credit" },
  { date: "2026-07-12", desc: "Property Insurance Premium", category: "Insurance", amount: 320000, type: "debit" },
  { date: "2026-07-10", desc: "Cleaning Services — PH Waterfront", category: "Operations", amount: 45000, type: "debit" },
  { date: "2026-07-08", desc: "Rent Collection — Lekki Gardens P3", category: "Income", amount: 8100000, type: "credit" },
];

export default function AccountingPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Accounting" action={{ label: "New Transaction" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Total Income (Jun)" value="₦48.2M" change={12.4} accentColor="var(--emerald)" />
          <KPICard label="Total Expenses" value="₦16.8M" accentColor="#EF4444" />
          <KPICard label="Net Operating Income" value="₦31.4M" change={11.2} accentColor="var(--gold)" />
          <KPICard label="Pending Invoices" value="₦2.1M" accentColor="#F97316" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Maintenance Costs", value: "₦4.2M", pct: "8.7%", color: "#F97316" },
            { label: "Staff & Operations", value: "₦6.1M", pct: "12.7%", color: "#3B82F6" },
            { label: "Insurance & Legal", value: "₦1.8M", pct: "3.7%", color: "#8B5CF6" },
          ].map((item) => (
            <Card key={item.label}>
              <CardBody>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-gray-400 mb-2">{item.label}</div>
                <div className="text-[20px] font-black text-gray-900">{item.value}</div>
                <div className="text-[11.5px] mt-1" style={{ color: item.color }}>{item.pct} of revenue</div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle sub="General ledger · July 2026">Transaction Ledger</CardTitle>
            <button className="text-[11.5px] font-semibold text-gray-500 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-50">Export CSV</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Description", "Category", "Amount", "Type"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEDGER.map((row, i) => (
                  <tr key={i} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-[12px] text-gray-600">{row.date}</td>
                    <td className="px-4 py-3 text-[12.5px] font-medium text-gray-900">{row.desc}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{row.category}</td>
                    <td className={`px-4 py-3 text-[12.5px] font-bold ${row.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                      {row.type === "credit" ? "+" : "-"}{formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${row.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {row.type === "credit" ? "Credit" : "Debit"}
                      </span>
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
