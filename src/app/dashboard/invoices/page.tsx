import { InvoicesTopbar, InvoiceRowActions } from "./InvoicesClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";

async function getInvoices() {
  try {
    return await db.invoice.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

const STATUS_BADGE: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  DRAFT: "default", PENDING_APPROVAL: "warning", APPROVED: "info", SENT: "info", PAID: "success", CANCELLED: "error",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const serialized = invoices.map((inv) => ({
    ...inv,
    lineItems: inv.lineItems as Array<{ description: string; qty: number; unitPrice: number }>,
    dueDate: inv.dueDate.toISOString(),
    issuedAt: inv.issuedAt.toISOString(),
    approvedAt: inv.approvedAt?.toISOString() ?? null,
    sentAt: inv.sentAt?.toISOString() ?? null,
    paidAt: inv.paidAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }));

  const paid = invoices.filter((i) => i.status === "PAID");
  const pending = invoices.filter((i) => ["PENDING_APPROVAL", "APPROVED", "SENT"].includes(i.status));
  const totalPaid = paid.reduce((s, i) => s + i.total, 0);
  const totalPending = pending.reduce((s, i) => s + i.total, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <InvoicesTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: invoices.length, icon: <FileText size={16} />, color: "var(--navy)" },
            { label: "Pending Payment", value: pending.length, icon: <Clock size={16} />, color: "var(--gold)" },
            { label: "Paid", value: paid.length, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Revenue Collected", value: formatCurrency(totalPaid), icon: <DollarSign size={16} />, color: "#3B82F6" },
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

        {totalPending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] text-gray-800"><strong>{formatCurrency(totalPending)}</strong> in invoices awaiting payment or approval.</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle sub={`${invoices.length} invoices raised`}>Invoice Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Invoice #", "Recipient", "Type", "Total", "Due Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serialized.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-10 text-[13px]">No invoices yet. Click "Create Invoice" to raise one.</td></tr>
                  ) : serialized.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 pl-5">
                        <span className="font-mono text-[12px] font-bold text-gray-900">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">{inv.recipientName}</div>
                        {inv.recipientEmail && <div className="text-[11px] text-gray-400">{inv.recipientEmail}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{inv.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(inv.total)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 whitespace-nowrap">
                        {new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[inv.status] ?? "default"}>{inv.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <InvoiceRowActions invoice={inv} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
