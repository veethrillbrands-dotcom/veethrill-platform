import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const STAGE_ORDER = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const STAGE_COLOR: Record<string, string> = {
  Lead: "bg-gray-100 text-gray-600",
  Qualified: "bg-blue-100 text-blue-700",
  Proposal: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

export default async function AgentPipelinePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const deals = await db.crmDeal.findMany({
    orderBy: { createdAt: "desc" },
  });

  const active = deals.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage));
  const won = deals.filter((d) => d.stage === "Closed Won");
  const totalValue = active.reduce((s, d) => s + (d.value ?? 0), 0);
  const wonValue = won.reduce((s, d) => s + (d.value ?? 0), 0);

  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    deals: deals.filter((d) => d.stage === stage),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Pipeline" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Deals", value: active.length, color: "var(--navy)" },
            { label: "Pipeline Value", value: formatCurrency(totalValue), color: "#3B82F6" },
            { label: "Closed Won", value: won.length, color: "var(--emerald)" },
            { label: "Won Value", value: formatCurrency(wonValue), color: "var(--gold)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[15px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {byStage.filter((s) => s.deals.length > 0).map(({ stage, deals: stageDeals }) => (
          <div key={stage} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${STAGE_COLOR[stage] ?? "bg-gray-100 text-gray-600"}`}>{stage}</span>
                <span className="text-[12px] text-gray-400">{stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="text-[12px] font-bold text-gray-700">{formatCurrency(stageDeals.reduce((s, d) => s + (d.value ?? 0), 0))}</div>
            </div>
            <div className="divide-y divide-gray-50">
              {stageDeals.map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{d.title}</div>
                    {d.contactName && <div className="text-[11.5px] text-gray-400">{d.contactName}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    {d.value && <div className="text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(d.value)}</div>}
                    {d.expectedCloseDate && (
                      <div className="text-[11px] text-gray-400">{new Date(d.expectedCloseDate).toLocaleDateString("en-GB")}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {deals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-[15px] font-bold text-gray-700">No Deals Yet</div>
            <div className="text-[12px] text-gray-400 mt-1">Your pipeline will appear here once deals are added.</div>
          </div>
        )}

      </div>
    </div>
  );
}
