import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge, statusToBadgeVariant } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { mockShortletBookings, mockKPIs } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, Users, TrendingUp, Star } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  DIRECT: "Direct",
  AIRBNB: "Airbnb",
  BOOKING_COM: "Booking.com",
  EXPEDIA: "Expedia",
  OTHER: "Other",
};

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "bg-emerald-100 text-emerald-700",
  AIRBNB: "bg-red-100 text-red-700",
  BOOKING_COM: "bg-blue-100 text-blue-700",
  EXPEDIA: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function ShortletsPage() {
  const active = mockShortletBookings.filter((b) => ["CONFIRMED", "CHECKED_IN"].includes(b.status)).length;
  const checkedIn = mockShortletBookings.filter((b) => b.status === "CHECKED_IN").length;
  const totalRevenue = mockShortletBookings.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Shortlet Management" action={{ label: "New Booking" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="Active Bookings"
            value={`${active}`}
            change={8.3}
            accentColor="var(--gold)"
            icon={<CalendarDays size={18} style={{ color: "var(--gold)" }} />}
          />
          <KPICard
            label="Currently Checked In"
            value={`${checkedIn}`}
            accentColor="var(--emerald)"
            icon={<Users size={18} style={{ color: "var(--emerald)" }} />}
          />
          <KPICard
            label="Shortlet Revenue"
            value={formatCurrency(mockKPIs.shortletRevenue)}
            change={15.2}
            accentColor="#8B5CF6"
            icon={<TrendingUp size={18} className="text-purple-600" />}
          />
          <KPICard
            label="Avg. Guest Rating"
            value="4.8 ★"
            accentColor="var(--gold)"
            icon={<Star size={18} style={{ color: "var(--gold)" }} />}
          />
        </div>

        {/* Booking Calendar Banner */}
        <div className="rounded-2xl p-5 border border-dashed border-yellow-300 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 mb-1">Availability Calendar</h3>
              <p className="text-[12px] text-gray-500">View and manage unit availability, block dates, and set seasonal pricing</p>
            </div>
            <button className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white" style={{ background: "var(--navy)" }}>
              Open Calendar
            </button>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle sub="Current month">Booking Sources</CardTitle>
            </CardHeader>
            <CardBody>
              {Object.entries({
                DIRECT: 6,
                AIRBNB: 5,
                BOOKING_COM: 4,
                EXPEDIA: 2,
                OTHER: 1,
              }).map(([source, count]) => (
                <div key={source} className="flex items-center gap-3 mb-3 last:mb-0">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10.5px] font-semibold ${SOURCE_COLORS[source]}`}>
                    {SOURCE_LABELS[source]}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${(count / 18) * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-bold text-gray-900 w-4 text-right">{count}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle sub="July 2026">Revenue Metrics</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  { label: "RevPAR", value: "₦38,400", sub: "Revenue per available room/night" },
                  { label: "ADR", value: "₦48,000", sub: "Average daily rate" },
                  { label: "Avg. Stay", value: "4.2 nights", sub: "Average booking length" },
                  { label: "Occ. Rate", value: "90%", sub: "Units occupied per night" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-[12px] font-semibold text-gray-900">{m.label}</div>
                      <div className="text-[10.5px] text-gray-400">{m.sub}</div>
                    </div>
                    <div className="text-[14px] font-black" style={{ color: "var(--gold)" }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle sub="Upcoming this week">Check-ins & Check-outs</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2.5">
                {mockShortletBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-sm flex-shrink-0">
                      {b.status === "CHECKED_IN" ? "🟢" : b.status === "CHECKED_OUT" ? "🔴" : "📅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11.5px] font-semibold text-gray-900 truncate">{b.guestName}</div>
                      <div className="text-[10.5px] text-gray-400">{b.unitNumber} · {b.nights}N</div>
                    </div>
                    <Badge variant={statusToBadgeVariant(b.status)}>
                      {b.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle sub={`${mockShortletBookings.length} bookings · July 2026`}>All Bookings</CardTitle>
            <div className="flex gap-2">
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Statuses</option>
                <option>Confirmed</option>
                <option>Checked In</option>
                <option>Checked Out</option>
              </select>
              <select className="text-[12px] border border-gray-100 px-3 py-1.5 rounded-lg outline-none text-gray-600 bg-white">
                <option>All Sources</option>
                <option>Direct</option>
                <option>Airbnb</option>
                <option>Booking.com</option>
              </select>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Guest", "Unit / Property", "Check-in", "Check-out", "Nights", "Total", "Source", "Guests", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockShortletBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-yellow-50/30 border-b border-gray-100 last:border-0 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[12.5px] font-semibold text-gray-900">{b.guestName}</div>
                      <div className="text-[11px] text-gray-400">{b.guestEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12.5px] font-medium text-gray-900">{b.unitNumber}</div>
                      <div className="text-[11px] text-gray-400">{b.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">{formatDate(b.checkIn)}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-700">{formatDate(b.checkOut)}</td>
                    <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{b.nights}</td>
                    <td className="px-4 py-3 text-[12.5px] font-bold text-gray-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded ${SOURCE_COLORS[b.source]}`}>
                        {SOURCE_LABELS[b.source]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{b.guestCount}</td>
                    <td className="px-4 py-3"><Badge variant={statusToBadgeVariant(b.status)}>{b.status.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-[11.5px] font-semibold" style={{ color: "var(--gold)" }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
