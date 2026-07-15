import { GuestsTopbar, GuestRowActions } from "./GuestsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Star, Calendar, Globe } from "lucide-react";

async function getGuests() {
  return db.shortletBooking.findMany({
    include: { unit: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
}

const SOURCE_EMOJI: Record<string, string> = { AIRBNB: "🔴", BOOKING_COM: "🔵", EXPEDIA: "🟡", DIRECT: "🟢", OTHER: "⚪" };
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default" | "error"> = {
  CHECKED_IN: "success", CONFIRMED: "info", PENDING: "warning", CHECKED_OUT: "default", CANCELLED: "error",
};

export default async function GuestsPage() {
  const bookings = await getGuests();
  const active = bookings.filter((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status)).length;
  const totalRevenue = bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.totalAmount, 0);
  const totalGuests = bookings.reduce((s, b) => s + b.guestCount, 0);

  const serialized = bookings.map((b) => ({
    ...b,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GuestsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: bookings.length, icon: <Calendar size={16} />, color: "var(--navy)" },
            { label: "Active Guests", value: active, icon: <Users size={16} />, color: "var(--emerald)" },
            { label: "Total Guests", value: totalGuests, icon: <Globe size={16} />, color: "#3B82F6" },
            { label: "Revenue", value: formatCurrency(totalRevenue), icon: <Star size={16} />, color: "var(--gold)" },
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

        <Card>
          <CardHeader>
            <CardTitle sub={`${bookings.length} total guest bookings`}>Guest Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Guest", "Contact", "Unit · Property", "Check-in", "Check-out", "Guests", "Total", "Source", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serialized.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-[13px]">No guest bookings yet. Click "New Booking" to add one.</td></tr>
                  ) : serialized.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 pl-5">
                        <div className="text-[13px] font-semibold text-gray-900">{b.guestName}</div>
                        <div className="text-[11px] text-gray-400">{b.guestEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{b.guestPhone}</td>
                      <td className="px-4 py-3">
                        <div className="text-[12px] font-semibold text-gray-900">{b.unit.unitNumber}</div>
                        <div className="text-[11px] text-gray-400">{b.unit.property.name}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-700 whitespace-nowrap">{formatDate(b.checkIn)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-700 whitespace-nowrap">{formatDate(b.checkOut)}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-gray-900 text-center">{b.guestCount}</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(b.totalAmount)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-700">{SOURCE_EMOJI[b.source]} {b.source.replace("_", ".")}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[b.status] ?? "default"}>{b.status.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <GuestRowActions booking={b} />
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
