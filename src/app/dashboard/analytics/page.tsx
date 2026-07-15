import { db } from "@/lib/db";
import { AnalyticsClient } from "./AnalyticsClient";

async function getLiveKPIs() {
  const [properties, units, tenants, payments, workOrders, leases] = await Promise.all([
    db.property.findMany({ include: { units: { include: { leases: { where: { status: "ACTIVE" } } } } } }),
    db.unit.count(),
    db.tenant.count(),
    db.payment.findMany({ select: { amount: true, status: true } }),
    db.workOrder.count({ where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }),
    db.lease.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalRevenue = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const overdueAmount = payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);
  const totalPayments = payments.filter((p) => ["PAID", "OVERDUE"].includes(p.status)).length;
  const paidCount = payments.filter((p) => p.status === "PAID").length;
  const collectionRate = totalPayments > 0 ? Math.round((paidCount / totalPayments) * 100) : 0;

  const propertyPerf = properties.map((prop) => {
    const propUnits = prop.units.length;
    const leasedUnits = prop.units.filter((u) => u.leases.length > 0).length;
    return { name: prop.name, revenue: 0, units: propUnits, leased: leasedUnits };
  });

  return {
    totalProperties: properties.length,
    totalUnits: units,
    totalTenants: tenants,
    totalRevenue,
    overdueAmount,
    openWorkOrders: workOrders,
    activeleases: leases,
    collectionRate,
    propertyPerf,
  };
}

export default async function AnalyticsPage() {
  const live = await getLiveKPIs();
  return <AnalyticsClient live={live} />;
}
