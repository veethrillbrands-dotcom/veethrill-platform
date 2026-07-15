import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OccupancyDonut } from "@/components/charts/OccupancyDonut";
import { revenueChartData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Analytics & Reporting" action={{ label: "Export Report" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Portfolio Value" value="₦2.8B" change={8.3} accentColor="var(--gold)" />
          <KPICard label="Net Operating Income" value="₦31.4M" change={11.2} accentColor="var(--emerald)" />
          <KPICard label="Avg. Cap Rate" value="8.4%" change={0.3} accentColor="#3B82F6" />
          <KPICard label="Avg. Days to Lease" value="18 days" change={-3} accentColor="#F97316" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><RevenueChart data={revenueChartData} /></div>
          <OccupancyDonut occupied={294} reserved={10} vacant={8} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Highest Performing", value: "Veethrill Towers", sub: "100% occ · ₦14.8M/mo", color: "var(--gold)" },
            { label: "Needs Attention", value: "Ikoyi Pearl Court", sub: "83% occ · 2 leases expiring", color: "#EF4444" },
            { label: "Fastest Growing", value: "Lekki Shortlet Suites", sub: "+22% revenue MoM", color: "var(--emerald)" },
          ].map((item) => (
            <Card key={item.label}>
              <CardBody>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-gray-400 mb-2">{item.label}</div>
                <div className="text-[16px] font-black" style={{ color: item.color }}>{item.value}</div>
                <div className="text-[11.5px] text-gray-500 mt-1">{item.sub}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
