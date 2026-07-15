import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

async function getPayments() {
  return db.payment.findMany({
    include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  PAID: "success", PENDING: "warning", OVERDUE: "error", PARTIAL: "info", REFUNDED: "default",
};
const METHOD_ICON: Record<string, string> = {
  PAYSTACK: "🟢", FLUTTERWAVE: "🟡", STRIPE: "🔵", BANK_TRANSFER: "🏦", CASH: "💵",
};

export default async function PaymentsPage() {
  const payments = await getPayments();

  const paid = payments.filter((p) => p.status === "PAID");
  const overdue = payments.filter((p) => p.status === "OVERDUE");
  const totalCollected = paid.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Rent & Payments" action={{ label: "Record Payment" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Collected", value: formatCurrency(totalCollected), icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Overdue", value: formatCurrency(totalOverdue), icon: <AlertTriangle size={16} />, color: "#EF4444" },
            { label: "Transactions", value: payments.length, icon: <CreditCard size={16} />, color: "var(--navy)" },
            { label: "Collection Rate", value: payments.length > 0 ? `${Math.round((paid.length / payments.length) * 100)}%` : "0%", icon: <TrendingUp size={16} />, color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[18px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Ledger */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${payments.length} transactions`}>Payment Ledger</CardTitle>
            <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Export
            </button>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Reference", "Tenant", "Unit · Property", "Type", "Method", "Amount", "Due Date", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-10 text-[13px]">No payments recorded yet.</td></tr>
                  ) : payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <span className="text-[11.5px] font-mono text-gray-600">{p.reference}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">
                          {p.tenant.user.firstName} {p.tenant.user.lastName}
                        </div>
                        <div className="text-[11px] text-gray-400">{p.tenant.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {p.lease ? (
                          <>
                            <div className="text-[12px] font-semibold text-gray-900">Unit {p.lease.unit.unitNumber}</div>
                            <div className="text-[11px] text-gray-400">{p.lease.unit.property.name}</div>
                          </>
                        ) : <span className="text-gray-400 text-[12px]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{p.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] text-gray-700">{METHOD_ICON[p.method] ?? "💳"} {p.method.replace("_", " ")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[14px] font-black ${p.status === "PAID" ? "text-emerald-600" : p.status === "OVERDUE" ? "text-red-600" : "text-gray-900"}`}>
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                        {formatDate(p.dueDate.toISOString())}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[p.status] ?? "default"}>{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Gateway Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Paystack", icon: "🟢", color: "#00C3F0", desc: "Nigeria · Cards · Bank" },
            { name: "Flutterwave", icon: "🟡", color: "#F5A623", desc: "Africa · Cards · Mobile" },
            { name: "Stripe", icon: "🔵", color: "#6772E5", desc: "International · Cards" },
            { name: "Bank Transfer", icon: "🏦", color: "var(--navy)", desc: "Direct · NEFT · RTGS" },
          ].map((gw) => (
            <div key={gw.name} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{gw.icon}</span>
                <span className="text-[13px] font-bold text-gray-900">{gw.name}</span>
              </div>
              <div className="text-[11px] text-gray-400">{gw.desc}</div>
              <div className="mt-2">
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
