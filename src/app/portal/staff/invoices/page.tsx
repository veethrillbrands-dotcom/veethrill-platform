import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { FileText, CreditCard, Clock, AlertTriangle } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SENT: "bg-indigo-100 text-indigo-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-500",
};

const TYPE_COLOR: Record<string, string> = {
  RENT: "bg-blue-100 text-blue-700",
  SHORTLET: "bg-purple-100 text-purple-700",
  SERVICE: "bg-yellow-100 text-yellow-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function StaffInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const invoices = await db.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });

  const paid = invoices.filter((i) => i.status === "PAID");
  const pending = invoices.filter((i) => ["PENDING_APPROVAL", "APPROVED", "SENT"].includes(i.status));
  const draft = invoices.filter((i) => i.status === "DRAFT");
  const overdue = invoices.filter((i) => {
    return i.status !== "PAID" && i.status !== "CANCELLED" && new Date(i.dueDate) < new Date();
  });

  const paidAmt = paid.reduce((s, i) => s + i.total, 0);
  const pendingAmt = pending.reduce((s, i) => s + i.total, 0);
  const overdueAmt = overdue.reduce((s, i) => s + i.total, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Invoices & Receipts" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Invoices", value: invoices.length, icon: <FileText size={14} />, color: "var(--navy)" },
            { label: "Amount Paid", value: formatCurrency(paidAmt), icon: <CreditCard size={14} />, color: "var(--emerald)" },
            { label: "Pending", value: formatCurrency(pendingAmt), icon: <Clock size={14} />, color: "var(--gold)" },
            { label: "Overdue", value: formatCurrency(overdueAmt), icon: <AlertTriangle size={14} />, color: overdueAmt > 0 ? "#EF4444" : "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-[14px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-600" />
              <div className="text-[13px] font-bold text-red-700">{overdue.length} Overdue Invoice{overdue.length !== 1 ? "s" : ""} · {formatCurrency(overdueAmt)}</div>
            </div>
            <div className="text-[12px] text-red-600">These invoices are past their due date and have not been paid.</div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">All Invoices ({invoices.length})</div>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-[13px]">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Invoice #", "Type", "Recipient", "Due Date", "Amount", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const isOverdue = inv.status !== "PAID" && inv.status !== "CANCELLED" && new Date(inv.dueDate) < new Date();
                    return (
                      <tr key={inv.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${isOverdue ? "bg-red-50/30" : ""}`}>
                        <td className="px-5 py-3 text-[12.5px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[inv.type] ?? "bg-gray-100 text-gray-600"}`}>{inv.type}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-[12.5px] font-semibold text-gray-900">{inv.recipientName}</div>
                          {inv.recipientEmail && <div className="text-[11px] text-gray-400">{inv.recipientEmail}</div>}
                        </td>
                        <td className="px-5 py-3">
                          <div className={`text-[12.5px] font-semibold ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                            {new Date(inv.dueDate).toLocaleDateString("en-GB")}
                          </div>
                          {isOverdue && <div className="text-[10px] font-bold text-red-500">OVERDUE</div>}
                        </td>
                        <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {inv.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
