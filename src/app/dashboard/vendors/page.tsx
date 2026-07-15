import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Wrench, Star, CheckCircle, Clock } from "lucide-react";

const VENDORS = [
  { name: "Apex Electrical Services", category: "Electrical", contact: "Mr. Babatunde Okafor", phone: "+234 803 111 2222", email: "apex@electricalng.com", rating: 4.8, jobs: 24, totalPaid: 1840000, verified: true, status: "Active", specializations: ["Generator", "Electrical", "Solar"] },
  { name: "CoolAir HVAC Nigeria", category: "HVAC", contact: "Mr. James Osei", phone: "+234 807 333 4444", email: "coolair@hvacng.com", rating: 4.6, jobs: 18, totalPaid: 1230000, verified: true, status: "Active", specializations: ["AC Installation", "AC Repair", "Ventilation"] },
  { name: "BuildRight Construction", category: "Construction", contact: "Engr. Kemi Adeyemi", phone: "+234 812 555 6666", email: "buildright@construct.ng", rating: 4.3, jobs: 9, totalPaid: 3450000, verified: true, status: "Active", specializations: ["Renovation", "Civil Works", "Tiling"] },
  { name: "AquaFix Plumbing", category: "Plumbing", contact: "Mr. Sunday Eze", phone: "+234 816 777 8888", email: "aquafix@plumbing.ng", rating: 4.5, jobs: 31, totalPaid: 780000, verified: false, status: "Active", specializations: ["Plumbing", "Water Treatment", "Drainage"] },
  { name: "SecureGuard Nigeria", category: "Security", contact: "Lt. Ahmed Musa (Rtd)", phone: "+234 802 999 0000", email: "info@secureguard.ng", rating: 4.9, jobs: 5, totalPaid: 2100000, verified: true, status: "Active", specializations: ["CCTV", "Access Control", "Guard Services"] },
  { name: "CleanPro Facility Management", category: "Cleaning", contact: "Mrs. Grace Okonkwo", phone: "+234 803 222 3333", email: "cleanpro@facility.ng", rating: 4.2, jobs: 42, totalPaid: 560000, verified: false, status: "Inactive", specializations: ["Cleaning", "Waste Management", "Landscaping"] },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={11} className={rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
      ))}
      <span className="text-[11.5px] font-bold text-gray-700 ml-1">{rating}</span>
    </div>
  );
}

export default function VendorsPage() {
  const verified = VENDORS.filter((v) => v.verified).length;
  const totalSpend = VENDORS.reduce((s, v) => s + v.totalPaid, 0);
  const avgRating = (VENDORS.reduce((s, v) => s + v.rating, 0) / VENDORS.length).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Vendor Management" action={{ label: "Add Vendor" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: VENDORS.length, icon: <Wrench size={16} />, color: "var(--navy)" },
            { label: "Verified", value: verified, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Avg Rating", value: avgRating, icon: <Star size={16} />, color: "var(--gold)" },
            { label: "Total Spend", value: formatCurrency(totalSpend), icon: <Clock size={16} />, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Vendor Cards */}
        <div className="grid grid-cols-3 gap-4">
          {VENDORS.map((v) => (
            <div key={v.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "var(--navy)" }}>
                    🔧
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-900">{v.name}</div>
                    <div className="text-[11px] text-gray-400">{v.category}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={v.status === "Active" ? "success" : "default"}>{v.status}</Badge>
                  {v.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
              </div>

              <StarRating rating={v.rating} />

              <div className="mt-3 space-y-1.5 text-[12px] text-gray-600">
                <div>{v.contact}</div>
                <div>{v.phone}</div>
                <div className="truncate">{v.email}</div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {v.specializations.map((s) => (
                  <span key={s} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="text-center bg-gray-50 rounded-xl p-2">
                  <div className="text-[15px] font-black text-gray-900">{v.jobs}</div>
                  <div className="text-[9.5px] text-gray-400 font-semibold uppercase">Jobs Done</div>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-2">
                  <div className="text-[12px] font-black" style={{ color: "var(--navy)" }}>{formatCurrency(v.totalPaid)}</div>
                  <div className="text-[9.5px] text-gray-400 font-semibold uppercase">Total Paid</div>
                </div>
              </div>

              <button className="w-full mt-3 py-2 rounded-xl text-[11.5px] font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Assign Work Order →
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
