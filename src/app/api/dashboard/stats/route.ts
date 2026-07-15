import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
      properties,
      units,
      activeLeases,
      overduePayments,
      openWorkOrders,
      activeBookings,
      recentPayments,
    ] = await Promise.all([
      db.property.findMany({ include: { units: true } }),
      db.unit.findMany(),
      db.lease.findMany({ where: { status: "ACTIVE" } }),
      db.payment.findMany({ where: { status: "OVERDUE" } }),
      db.workOrder.findMany({ where: { status: { not: "COMPLETED" } } }),
      db.shortletBooking.findMany({ where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
      db.payment.findMany({
        where: { status: "PAID", paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
    ]);

    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100 * 10) / 10 : 0;
    const monthlyRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueRent = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const shortletRevenue = recentPayments.filter((p) => p.type === "SHORTLET").reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      occupancyRate,
      monthlyRevenue,
      overdueRent,
      openWorkOrders: openWorkOrders.length,
      activeLeases: activeLeases.length,
      activeShortlets: activeBookings.length,
      shortletRevenue,
      collectionRate: monthlyRevenue > 0 ? Math.round((monthlyRevenue / (monthlyRevenue + overdueRent)) * 100 * 10) / 10 : 0,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
