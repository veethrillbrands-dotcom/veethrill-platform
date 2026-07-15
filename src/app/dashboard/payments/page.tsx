import { PaymentsTopbar, PaymentsTable } from "./PaymentsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

async function getPayments() {
  return db.payment.findMany({
    include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  const paid = payments.filter((p) => p.status === "PAID");
  const overdue = payments.filter((p) => p.status === "OVERDUE");
  const totalCollected = paid.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0);

  const serializable = payments.map((p) => ({
    ...p,
    dueDate: p.dueDate.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    paidAt: p.paidAt?.toISOString() ?? null,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PaymentsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Collected", value: formatCurrency(totalCollected), icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Overdue", value: formatCurrency(totalOverdue), icon: <AlertTriangle size={16} />, color: "#EF4444" },
            { label: "Transactions", value: payments.length, icon: <CreditCard size={16} />, color: "var(--navy)" },
            { label: "Collection Rate", value: payments.length > 0 ? `${Math.round((paid.length / payments.length) * 100)}%` : "0%", icon: <TrendingUp size={16} />, color: "var(--gold)" },
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
            <CardTitle sub={`${payments.length} transactions — hover row for actions`}>Payment Ledger</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <PaymentsTable payments={serializable as any} />
          </CardBody>
        </Card>

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
