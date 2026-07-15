"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, Trash2 } from "lucide-react";

type Payment = {
  id: string; reference: string; amount: number; type: string; method: string;
  status: string; dueDate: string;
  tenant: { user: { firstName: string; lastName: string; email: string } };
  lease: { unit: { unitNumber: string; property: { name: string } } } | null;
};

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  PAID: "success", PENDING: "warning", OVERDUE: "error", PARTIAL: "info", REFUNDED: "default",
};
const METHOD_ICON: Record<string, string> = {
  PAYSTACK: "🟢", FLUTTERWAVE: "🟡", STRIPE: "🔵", BANK_TRANSFER: "🏦", CASH: "💵",
};

export function PaymentsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Rent & Payments" action={{ label: "Record Payment", onClick: () => setOpen(true) }} />
      {open && <RecordPaymentModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function markPaid(id: string) {
    setLoading(id);
    await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    setLoading(null);
    router.refresh();
  }

  async function deletePayment(id: string) {
    if (!confirm("Delete this payment record?")) return;
    setLoading(id + "_del");
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["Reference", "Tenant", "Unit · Property", "Type", "Method", "Amount", "Due Date", "Status", ""].map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr><td colSpan={9} className="text-center text-gray-400 py-10 text-[13px]">No payments recorded yet.</td></tr>
          ) : payments.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
              <td className="px-4 py-3 pl-5">
                <span className="text-[11.5px] font-mono text-gray-600">{p.reference}</span>
              </td>
              <td className="px-4 py-3">
                <div className="text-[13px] font-semibold text-gray-900">{p.tenant.user.firstName} {p.tenant.user.lastName}</div>
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
                <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{p.type.replace("_", " ")}</span>
              </td>
              <td className="px-4 py-3 text-[12px] text-gray-700">{METHOD_ICON[p.method] ?? "💳"} {p.method.replace("_", " ")}</td>
              <td className="px-4 py-3">
                <span className={`text-[14px] font-black ${p.status === "PAID" ? "text-emerald-600" : p.status === "OVERDUE" ? "text-red-600" : "text-gray-900"}`}>
                  {formatCurrency(p.amount)}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDate(p.dueDate)}</td>
              <td className="px-4 py-3"><Badge variant={STATUS_BADGE[p.status] ?? "default"}>{p.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(p.status === "OVERDUE" || p.status === "PENDING") && (
                    <button onClick={() => markPaid(p.id)} disabled={loading === p.id}
                      title="Mark as Paid"
                      className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      {loading === p.id
                        ? <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        : <CheckCircle size={13} className="text-emerald-600" />}
                    </button>
                  )}
                  <button onClick={() => deletePayment(p.id)} disabled={loading === p.id + "_del"}
                    title="Delete"
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
