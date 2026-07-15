import { ShortletsTopbar, BookingRowActions } from "./ShortletsClient";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, Users, TrendingUp, Star } from "lucide-react";

async function getBookings() {
  return db.shortletBooking.findMany({
    include: { unit: { include: { property: true } } },
    orderBy: { checkIn: "asc" },
  });
}

const SOURCE_COLOR: Record<string, string> = {
  AIRBNB: "bg-red-100 text-red-700", BOOKING_COM: "bg-blue-100 text-blue-700",
  EXPEDIA: "bg-yellow-100 text-yellow-700", DIRECT: "bg-emerald-100 text-emerald-700", OTHER: "bg-gray-100 text-gray-600",
};
const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default" | "error"> = {
  CHECKED_IN: "success", CONFIRMED: "info", PENDING: "warning", CHECKED_OUT: "default", CANCELLED: "error", NO_SHOW: "error",
};

export default async function ShortletsPage() {
  const bookings = await getBookings();
  const active = bookings.filter((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status));
  const totalRevenue = bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.totalAmount, 0);
  const totalNights = bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.nights, 0);
  const adr = totalNights > 0 ? totalRevenue / totalNights : 0;

  const serialized = bookings.map((b) => ({
    ...b,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ShortletsTopbar />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Bookings", value: active.length, icon: <CalendarDays size={16} />, color: "var(--emerald)" },
            { label: "Total Bookings", value: bookings.length, icon: <Users size={16} />, color: "var(--navy)" },
            { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: <TrendingUp size={16} />, color: "var(--gold)" },
            { label: "Avg Daily Rate", value: formatCurrency(adr), icon: <Star size={16} />, color: "#3B82F6" },
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
            <CardTitle sub={`${bookings.length} total bookings`}>Booking Register</CardTitle>
          </CardHeader>
          <CardBody noPad>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Guest", "Unit · Property", "Check-in", "Check-out", "Nights", "Amount", "Source", "Status", "Code", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serialized.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-gray-400 py-10 text-[13px]">No bookings yet. Click "New Booking" to add one.</td></tr>
                  ) : serialized.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3 pl-5">
                        <div className="text-[13px] font-semibold text-gray-900">{b.guestName}</div>
                        <div className="text-[11px] text-gray-400">{b.guestPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[12px] font-semibold text-gray-900">{b.unit.unitNumber}</div>
                        <div className="text-[11px] text-gray-400">{b.unit.property.name}</div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-700 whitespace-nowrap">{formatDate(b.checkIn)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-700 whitespace-nowrap">{formatDate(b.checkOut)}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">{b.nights}</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(b.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLOR[b.source] ?? "bg-gray-100 text-gray-600"}`}>
                          {b.source.replace("_", ".")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[b.status] ?? "default"}>{b.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {b.checkInCode ? (
                          <span className="font-mono text-[12px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{b.checkInCode}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <BookingRowActions booking={b} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          {[
            { source: "AIRBNB", label: "Airbnb", color: "#FF5A5F" },
            { source: "BOOKING_COM", label: "Booking.com", color: "#003580" },
            { source: "EXPEDIA", label: "Expedia", color: "#FFC72C" },
            { source: "DIRECT", label: "Direct", color: "var(--emerald)" },
          ].map((ch) => (
            <div key={ch.source} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[13px] font-bold text-gray-900 mb-1">{ch.label}</div>
              <div className="text-[28px] font-black" style={{ color: ch.color }}>{bookings.filter((b) => b.source === ch.source).length}</div>
              <div className="text-[11px] text-gray-400">bookings</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
