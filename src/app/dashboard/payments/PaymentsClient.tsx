"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, Trash2, CheckSquare } from "lucide-react";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} payment records?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/payments/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    router.refresh();
  }

  async function bulkMarkPaid() {
    const pending = payments.filter((p) => selected.has(p.id) && (p.status === "PENDING" || p.status === "OVERDUE"));
    if (!pending.length) return;
    await Promise.all(pending.map((p) => fetch(`/api/payments/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) })));
    setSelected(new Set());
    router.refresh();
  }

  function toggleSelect(id: string) { setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleAll() { setSelected(payments.length > 0 && payments.every((p) => selected.has(p.id)) ? new Set() : new Set(payments.map((p) => p.id))); }
  const allChecked = payments.length > 0 && payments.every((p) => selected.has(p.id));

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 mx-1">
          <CheckSquare size={14} className="text-red-600" />
          <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
          <button onClick={bulkMarkPaid}
            className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors">
            <CheckCircle size={12} />Mark Paid
          </button>
          <button onClick={bulkDelete}
            className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
            <Trash2 size={12} />Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500 hover:text-red-700">Clear</button>
        </div>
      )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pl-5 pr-2 py-3 w-8">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
            </th>
            {["Reference", "Tenant", "Unit · Property", "Type", "Method", "Amount", "Due Date", "Status", ""].map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-[13px]">No payments recorded yet.</td></tr>
          ) : payments.map((p) => (
            <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selected.has(p.id) ? "bg-blue-50/40" : ""}`}>
              <td className="pl-5 pr-2 py-3">
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
              </td>
              <td className="px-4 py-3">
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
    </div>
  );
}
