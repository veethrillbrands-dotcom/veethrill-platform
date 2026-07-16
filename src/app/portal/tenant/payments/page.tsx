import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";

export default async function TenantPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        include: {
          payments: { orderBy: { dueDate: "desc" } },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  const payments = user.tenant?.payments ?? [];

  const paid = payments.filter((p) => p.status === "PAID");
  const overdue = payments.filter((p) => p.status === "OVERDUE");
  const pending = payments.filter((p) => p.status === "PENDING");

  const STATUS_COLOR: Record<string, string> = {
    PAID: "bg-emerald-100 text-emerald-700",
    OVERDUE: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PARTIAL: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Payments" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Paid", value: paid.length, amount: paid.reduce((s, p) => s + p.amount, 0), color: "var(--emerald)" },
            { label: "Pending", value: pending.length, amount: pending.reduce((s, p) => s + p.amount, 0), color: "var(--gold)" },
            { label: "Overdue", value: overdue.length, amount: overdue.reduce((s, p) => s + p.amount, 0), color: "#EF4444" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[18px] font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{formatCurrency(k.amount)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Payment History</div>
          {payments.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-[13px]">No payment records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Type", "Due Date", "Paid Date", "Amount", "Status"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-[13px] font-semibold text-gray-900">{p.type}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{new Date(p.dueDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-5 py-3 text-[12.5px] text-gray-600">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status}</span>
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
