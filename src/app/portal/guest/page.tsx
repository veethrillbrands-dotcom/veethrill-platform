import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Moon, MapPin, Key } from "lucide-react";

export default async function GuestPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  // Find bookings by matching email
  const [bookings, invoices] = await Promise.all([
    db.shortletBooking.findMany({
      where: {
        OR: [{ guestUserId: user.id }, { guestEmail: user.email }],
      },
      include: { unit: { include: { property: true } } },
      orderBy: { checkIn: "desc" },
    }),
    db.invoice.findMany({
      where: { bookingId: { not: null }, recipientEmail: user.email },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const activeBooking = bookings.find((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status));

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
    CHECKED_IN: "bg-emerald-100 text-emerald-700", CHECKED_OUT: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PortalTopbar title="My Booking" />
      <div className="flex-1 p-4 sm:p-6 space-y-5">

        <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--navy), #1a3a5c)" }}>
          <div className="text-[13px] text-white/60">Welcome</div>
          <div className="text-[22px] font-black mt-0.5">{user.firstName} {user.lastName}</div>
          {activeBooking ? (
            <div className="text-[13px] text-white/70 mt-1">
              {activeBooking.unit.property.name} · Unit {activeBooking.unit.unitNumber} · {activeBooking.nights} nights
            </div>
          ) : (
            <div className="text-[13px] text-white/50 mt-1">No active booking</div>
          )}
        </div>

        {activeBooking && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="font-bold text-gray-900 text-[15px]">Active Booking</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Check-in", value: new Date(activeBooking.checkIn).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), icon: <CalendarDays size={14} /> },
                { label: "Check-out", value: new Date(activeBooking.checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), icon: <CalendarDays size={14} /> },
                { label: "Nights", value: String(activeBooking.nights), icon: <Moon size={14} /> },
                { label: "Total", value: formatCurrency(activeBooking.totalAmount), icon: <Key size={14} /> },
              ].map((k) => (
                <div key={k.label} className="text-center p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">{k.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span></div>
                  <div className="text-[15px] font-black text-gray-900">{k.value}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50">
              <MapPin size={14} className="text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-[12.5px] font-semibold text-gray-900">{activeBooking.unit.property.name} · Unit {activeBooking.unit.unitNumber}</div>
                <div className="text-[11.5px] text-gray-500">{activeBooking.unit.property.address}, {activeBooking.unit.property.city}</div>
              </div>
            </div>
            {activeBooking.checkInCode && (
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50">
                <Key size={20} className="text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Check-in Code</div>
                  <div className="text-[22px] font-black tracking-widest" style={{ color: "var(--navy)" }}>{activeBooking.checkInCode}</div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Status</span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${STATUS_COLOR[activeBooking.status] ?? "bg-gray-100 text-gray-600"}`}>{activeBooking.status.replace("_", " ")}</span>
            </div>
          </div>
        )}

        {/* All bookings */}
        {bookings.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Booking History</div>
            <div className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{b.unit.property.name} · Unit {b.unit.unitNumber}</div>
                    <div className="text-[11.5px] text-gray-400">{new Date(b.checkIn).toLocaleDateString("en-GB")} → {new Date(b.checkOut).toLocaleDateString("en-GB")} · {b.nights}n</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[12.5px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(b.totalAmount)}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? "bg-gray-100 text-gray-600"}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Receipts & Invoices</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50">
                      <td className="px-5 py-3 text-[12px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{inv.description}</td>
                      <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                      <td className="px-5 py-3"><span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏨</div>
            <div className="text-[15px] font-bold text-gray-700">No bookings found</div>
            <div className="text-[12px] text-gray-400 mt-1">Your shortlet booking will appear here once confirmed</div>
          </div>
        )}

      </div>
    </div>
  );
}
