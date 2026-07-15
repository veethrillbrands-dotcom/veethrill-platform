import { VendorsTopbar, VendorRowActions, StarRating } from "./VendorsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Wrench, Star, CheckCircle, Clock } from "lucide-react";

async function getVendors() {
  return db.vendor.findMany({
    include: { user: true, workOrders: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function VendorsPage() {
  const vendors = await getVendors();
  const verified = vendors.filter((v) => v.isVerified).length;
  const avgRating = vendors.length > 0 ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1) : "0";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <VendorsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: vendors.length, icon: <Wrench size={16} />, color: "var(--navy)" },
            { label: "Verified", value: verified, icon: <CheckCircle size={16} />, color: "var(--emerald)" },
            { label: "Avg Rating", value: avgRating, icon: <Star size={16} />, color: "var(--gold)" },
            { label: "Total Work Orders", value: vendors.reduce((s, v) => s + v.workOrders.length, 0), icon: <Clock size={16} />, color: "#3B82F6" },
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

        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🔧</div>
            <div className="text-[16px] font-bold text-gray-900 mb-1">No vendors registered yet</div>
            <div className="text-[13px] text-gray-400">Click "Add Vendor" to register a service provider.</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--navy)" }}>🔧</div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900">{v.companyName}</div>
                      <div className="text-[11px] text-gray-400">{v.user.firstName} {v.user.lastName}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={v.isVerified ? "success" : "default"}>{v.isVerified ? "Verified" : "Unverified"}</Badge>
                  </div>
                </div>

                <StarRating rating={v.rating} />

                <div className="mt-3 space-y-1 text-[12px] text-gray-600">
                  <div>{v.user.phone ?? "No phone"}</div>
                  <div className="truncate">{v.user.email}</div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {v.specialization.map((s) => (
                    <span key={s} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="text-center bg-gray-50 rounded-xl p-2">
                    <div className="text-[15px] font-black text-gray-900">{v.workOrders.length}</div>
                    <div className="text-[9.5px] text-gray-400 font-semibold uppercase">Work Orders</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-xl p-2">
                    <div className="text-[12px] font-black" style={{ color: "var(--navy)" }}>{v.bankName ?? "—"}</div>
                    <div className="text-[9.5px] text-gray-400 font-semibold uppercase">Bank</div>
                  </div>
                </div>

                <div className="mt-3">
                  <VendorRowActions vendor={v} />
                </div>
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle sub="All registered vendors">Vendor Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Company", "Contact", "Specializations", "Jobs", "Rating", "Verified", ""].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-8 text-[13px]">No vendors yet.</td></tr>
                ) : vendors.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                    <td className="px-4 py-3 pl-5">
                      <div className="text-[13px] font-semibold text-gray-900">{v.companyName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-gray-700">{v.user.firstName} {v.user.lastName}</div>
                      <div className="text-[11px] text-gray-400">{v.user.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {v.specialization.slice(0, 2).map((s) => (
                          <span key={s} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-gray-900">{v.workOrders.length}</td>
                    <td className="px-4 py-3"><StarRating rating={v.rating} /></td>
                    <td className="px-4 py-3">
                      <Badge variant={v.isVerified ? "success" : "default"}>{v.isVerified ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <VendorRowActions vendor={v} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
