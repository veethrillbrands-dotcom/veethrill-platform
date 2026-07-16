import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";

export default async function OwnerInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const invoices = await db.invoice.findMany({
    where: { recipientEmail: user.email, status: { in: ["APPROVED", "SENT", "PAID"] } },
    orderBy: { issuedAt: "desc" },
  });

  const STATUS_COLOR: Record<string, string> = {
    APPROVED: "bg-blue-100 text-blue-700",
    SENT: "bg-yellow-100 text-yellow-700",
    PAID: "bg-emerald-100 text-emerald-700",
  };

  const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter((i) => i.status !== "PAID").reduce((s, i) => s + i.total, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="Invoices & Receipts" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Invoices", value: invoices.length, color: "var(--navy)" },
            { label: "Amount Paid", value: formatCurrency(paid), color: "var(--emerald)" },
            { label: "Outstanding", value: formatCurrency(outstanding), color: outstanding > 0 ? "#EF4444" : "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[16px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">All Invoices</div>
          {invoices.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-[13px]">No invoices found for your account.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Invoice #", "Description", "Date", "Amount", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[12.5px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600 max-w-[200px] truncate">{inv.description}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{new Date(inv.issuedAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>{inv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
