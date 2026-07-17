import { AccountingTopbar, ManualLedger } from "./AccountingClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

async function getAccountingData() {
  const [payments, workOrders] = await Promise.all([
    db.payment.findMany({
      include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    db.workOrder.findMany({ where: { actualCost: { gt: 0 } } }),
  ]);
  return { payments, workOrders };
}

export default async function AccountingPage() {
  const { payments, workOrders } = await getAccountingData();

  const income = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const expenses = workOrders.reduce((s, w) => s + (w.actualCost ?? 0), 0);
  const overdue = payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);
  const noi = income - expenses;

  // Build ledger: paid payments as credits, work order costs as debits
  const ledger = [
    ...payments.map((p) => ({
      date: p.paidAt ?? p.createdAt,
      description: `${p.type} — ${p.tenant.user.firstName} ${p.tenant.user.lastName}${p.lease ? ` · ${p.lease.unit.property.name}` : ""}`,
      category: p.type,
      amount: p.amount,
      type: p.status === "PAID" ? "credit" : "debit",
      ref: p.reference,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const fixedExpenses = [
    { description: "Generator Maintenance — Lekki Gardens", category: "Maintenance", amount: 65000, type: "debit" as const, date: new Date("2026-07-14") },
    { description: "Pool Pump Repair — Ikoyi Residences", category: "Facility", amount: 280000, type: "debit" as const, date: new Date("2026-07-10") },
    { description: "Security Guard Salaries — All Properties", category: "Payroll", amount: 420000, type: "debit" as const, date: new Date("2026-07-01") },
    { description: "Property Insurance Premium", category: "Insurance", amount: 350000, type: "debit" as const, date: new Date("2026-07-01") },
    { description: "Platform & Software Subscriptions", category: "Technology", amount: 45000, type: "debit" as const, date: new Date("2026-07-01") },
  ];

  const allLedger = [...ledger, ...fixedExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalExpenses = expenses + fixedExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AccountingTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* P&L Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Income", value: income, icon: <ArrowUpRight size={16} />, color: "var(--emerald)", positive: true },
            { label: "Total Expenses", value: totalExpenses, icon: <ArrowDownRight size={16} />, color: "#EF4444", positive: false },
            { label: "Net Operating Income", value: income - totalExpenses, icon: <DollarSign size={16} />, color: income > totalExpenses ? "var(--gold)" : "#EF4444", positive: income > totalExpenses },
            { label: "Overdue Receivables", value: overdue, icon: <TrendingDown size={16} />, color: overdue > 0 ? "#EF4444" : "var(--emerald)", positive: false },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                  {k.icon}
                </div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
              </div>
              <div className="text-[22px] font-black" style={{ color: k.color }}>
                {formatCurrency(Math.abs(k.value))}
              </div>
            </div>
          ))}
        </div>

        {/* P&L Statement */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle sub="Jul 2026">P&L Statement</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Revenue</div>
                  {[
                    { label: "Rent Collected", amount: income },
                    { label: "Shortlet Revenue", amount: 380000 },
                    { label: "Late Fees", amount: 45000 },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-[12px] text-gray-700">{r.label}</span>
                      <span className="text-[12px] font-semibold text-emerald-600">{formatCurrency(r.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 mt-1">
                    <span className="text-[12px] font-bold text-gray-900">Gross Revenue</span>
                    <span className="text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(income + 425000)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Expenses</div>
                  {[
                    { label: "Maintenance", amount: 65000 + 280000 },
                    { label: "Payroll", amount: 420000 },
                    { label: "Insurance", amount: 350000 },
                    { label: "Technology", amount: 45000 },
                  ].map((e) => (
                    <div key={e.label} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-[12px] text-gray-700">{e.label}</span>
                      <span className="text-[12px] font-semibold text-red-500">({formatCurrency(e.amount)})</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 mt-1">
                    <span className="text-[12px] font-bold text-gray-900">Total Expenses</span>
                    <span className="text-[13px] font-black text-red-500">({formatCurrency(totalExpenses)})</span>
                  </div>
                </div>
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-[13px] font-black text-gray-900">Net Income</span>
                    <span className="text-[14px] font-black" style={{ color: "var(--gold)" }}>{formatCurrency(income - totalExpenses)}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Ledger */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle sub={`${allLedger.length} transactions`}>Transaction Ledger</CardTitle>
              <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Export
              </button>
            </CardHeader>
            <CardBody noPad>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-100">
                      {["Date", "Description", "Category", "Amount", "Type"].map((h) => (
                        <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allLedger.map((t, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 pl-5 text-[11.5px] text-gray-500 whitespace-nowrap">
                          {formatDate(new Date(t.date).toISOString())}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-gray-900 max-w-[220px] truncate">{t.description}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10.5px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.category}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[13px] font-black ${t.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                            {t.type === "credit" ? "+" : "−"}{formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${t.type === "credit" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {t.type === "credit" ? "CREDIT" : "DEBIT"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Manual Entries */}
        <ManualLedger />

      </div>
    </div>
  );
}
