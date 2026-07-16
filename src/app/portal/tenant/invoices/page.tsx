import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";

export default async function TenantInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId }, include: { tenant: true } });
  const tenantId = user?.tenant?.id;

  const invoices = tenantId
    ? await db.invoice.findMany({
        where: { tenantId, status: { in: ["APPROVED", "SENT", "PAID"] } },
        orderBy: { issuedAt: "desc" },
      })
    : [];

  const STATUS_COLOR: Record<string, string> = {
    APPROVED: "bg-blue-100 text-blue-700", SENT: "bg-yellow-100 text-yellow-700", PAID: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Invoices & Receipts" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Invoice #", "Description", "Amount", "Due Date", "Status"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-10 text-[13px]">No invoices yet.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-[12.5px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-600 max-w-[240px] truncate">{inv.description}</td>
                    <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-500">{new Date(inv.dueDate).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
