import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { FileText, Calendar, Home, CreditCard } from "lucide-react";

export default async function TenantLeasePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        include: {
          leases: {
            include: { unit: { include: { property: true } } },
            orderBy: { startDate: "desc" },
          },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  const leases = user.tenant?.leases ?? [];
  const activeLease = leases.find((l) => l.status === "ACTIVE");

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    EXPIRED: "bg-gray-100 text-gray-500",
    TERMINATED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Lease" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        {activeLease ? (
          <>
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
              <div className="text-[13px] text-white/60">Active Lease</div>
              <div className="text-[20px] font-black mt-1">{activeLease.unit.property.name}</div>
              <div className="text-[13px] text-white/70 mt-0.5">Unit {activeLease.unit.unitNumber} · {activeLease.unit.property.city}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Monthly Rent", value: formatCurrency(activeLease.rentAmount), icon: <CreditCard size={14} />, color: "var(--navy)" },
                { label: "Deposit", value: activeLease.depositAmount ? formatCurrency(activeLease.depositAmount) : "—", icon: <CreditCard size={14} />, color: "var(--gold)" },
                { label: "Start Date", value: new Date(activeLease.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: <Calendar size={14} />, color: "var(--emerald)" },
                { label: "End Date", value: new Date(activeLease.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: <Calendar size={14} />, color: "#EF4444" },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
                  </div>
                  <div className="text-[14px] font-black text-gray-900">{k.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="font-bold text-gray-900 text-[14px]">Property Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Property</span>
                  <span className="font-semibold text-gray-900">{activeLease.unit.property.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Unit</span>
                  <span className="font-semibold text-gray-900">{activeLease.unit.unitNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Address</span>
                  <span className="font-semibold text-gray-900 text-right">{activeLease.unit.property.address}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">City</span>
                  <span className="font-semibold text-gray-900">{activeLease.unit.property.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[activeLease.status] ?? "bg-gray-100 text-gray-600"}`}>{activeLease.status}</span>
                </div>
                {activeLease.notes && (
                  <div className="flex justify-between py-2 border-b border-gray-50 col-span-2">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">{activeLease.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📄</div>
            <div className="text-[16px] font-bold text-gray-700">No Active Lease</div>
            <div className="text-[13px] text-gray-400 mt-2">Your lease agreement will appear here once activated.</div>
          </div>
        )}

        {leases.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Lease History</div>
            <div className="divide-y divide-gray-50">
              {leases.filter((l) => l.status !== "ACTIVE").map((l) => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{l.unit.property.name} · Unit {l.unit.unitNumber}</div>
                    <div className="text-[11.5px] text-gray-400">
                      {new Date(l.startDate).toLocaleDateString("en-GB")} → {new Date(l.endDate).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[l.status] ?? "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
