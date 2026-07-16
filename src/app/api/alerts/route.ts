import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "RENT" | "LEASE" | "MAINTENANCE" | "INSPECTION" | "INVOICE" | "TASK" | "DEAL" | "CRM";
  headline: string;
  detail: string;
  href: string;
  count?: number;
  amount?: number;
};

export async function GET() {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * 86400000);
  const in30 = new Date(now.getTime() + 30 * 86400000);

  const [
    overduePayments,
    expiring14,
    expiring30,
    urgentWorkOrders,
    overdueInspections,
    overdueInvoices,
    overdueTasks,
    stalledDeals,
  ] = await Promise.all([
    db.payment.count({ where: { status: "OVERDUE" } }),
    db.lease.count({ where: { status: "ACTIVE", endDate: { lte: in14 } } }),
    db.lease.count({ where: { status: "ACTIVE", endDate: { gt: in14, lte: in30 } } }),
    db.workOrder.findMany({
      where: { status: { in: ["OPEN", "ASSIGNED"] }, priority: { in: ["URGENT", "HIGH"] } },
      include: { property: true },
      take: 5,
    }),
    db.inspection.count({ where: { completedAt: null, scheduledAt: { lt: now } } }),
    db.invoice.aggregate({
      where: { status: { in: ["SENT", "APPROVED"] }, dueDate: { lt: now } },
      _count: true,
      _sum: { total: true },
    }),
    db.crmTask.count({
      where: { status: { not: "COMPLETED" }, dueAt: { lt: now } },
    }),
    db.crmDeal.findMany({
      where: {
        stage: { notIn: ["Closed Won", "Closed Lost"] },
        updatedAt: { lt: new Date(now.getTime() - 14 * 86400000) }, // no update in 14 days
      },
      take: 5,
    }),
  ]);

  const alerts: Alert[] = [];

  // Overdue rent
  if (overduePayments > 0) {
    alerts.push({
      id: "overdue-rent",
      severity: overduePayments >= 5 ? "critical" : "warning",
      category: "RENT",
      headline: `${overduePayments} tenant${overduePayments > 1 ? "s" : ""} with overdue rent`,
      detail: "Send payment reminders and escalate if over 30 days.",
      href: "/dashboard/payments",
      count: overduePayments,
    });
  }

  // Lease expiring in 14 days
  if (expiring14 > 0) {
    alerts.push({
      id: "lease-expiring-14",
      severity: "critical",
      category: "LEASE",
      headline: `${expiring14} lease${expiring14 > 1 ? "s" : ""} expiring within 14 days`,
      detail: "Send renewal offers immediately to avoid vacancy loss.",
      href: "/dashboard/leases",
      count: expiring14,
    });
  }

  // Lease expiring in 30 days
  if (expiring30 > 0) {
    alerts.push({
      id: "lease-expiring-30",
      severity: "warning",
      category: "LEASE",
      headline: `${expiring30} lease${expiring30 > 1 ? "s" : ""} expiring within 30 days`,
      detail: "Proactively engage tenants with renewal terms.",
      href: "/dashboard/leases",
      count: expiring30,
    });
  }

  // Urgent/high work orders
  if (urgentWorkOrders.length > 0) {
    const properties = [...new Set(urgentWorkOrders.map((w) => w.property.name))].slice(0, 2).join(", ");
    alerts.push({
      id: "urgent-maintenance",
      severity: "critical",
      category: "MAINTENANCE",
      headline: `${urgentWorkOrders.length} urgent maintenance job${urgentWorkOrders.length > 1 ? "s" : ""} open`,
      detail: `Affects: ${properties}${urgentWorkOrders.length > 2 ? " and others" : ""}. Assign vendors immediately.`,
      href: "/dashboard/maintenance",
      count: urgentWorkOrders.length,
    });
  }

  // Overdue inspections
  if (overdueInspections > 0) {
    alerts.push({
      id: "overdue-inspections",
      severity: "warning",
      category: "INSPECTION",
      headline: `${overdueInspections} inspection${overdueInspections > 1 ? "s" : ""} past due date`,
      detail: "Schedule overdue inspections to maintain property health scores.",
      href: "/dashboard/inspections",
      count: overdueInspections,
    });
  }

  // Overdue invoices
  if ((overdueInvoices._count ?? 0) > 0) {
    alerts.push({
      id: "overdue-invoices",
      severity: "warning",
      category: "INVOICE",
      headline: `${overdueInvoices._count} invoice${overdueInvoices._count! > 1 ? "s" : ""} past due`,
      detail: `₦${(overdueInvoices._sum?.total ?? 0).toLocaleString()} outstanding. Chase payments.`,
      href: "/dashboard/invoices",
      count: overdueInvoices._count ?? 0,
      amount: overdueInvoices._sum?.total ?? 0,
    });
  }

  // Overdue CRM tasks
  if (overdueTasks > 0) {
    alerts.push({
      id: "overdue-tasks",
      severity: "info",
      category: "TASK",
      headline: `${overdueTasks} CRM task${overdueTasks > 1 ? "s" : ""} overdue`,
      detail: "Review and complete pending follow-ups and reminders.",
      href: "/dashboard/crm/tasks",
      count: overdueTasks,
    });
  }

  // Stalled deals
  if (stalledDeals.length > 0) {
    alerts.push({
      id: "stalled-deals",
      severity: "info",
      category: "DEAL",
      headline: `${stalledDeals.length} deal${stalledDeals.length > 1 ? "s" : ""} stalled (no activity in 14+ days)`,
      detail: "Re-engage these deals or update their pipeline stage.",
      href: "/dashboard/crm/pipeline",
      count: stalledDeals.length,
    });
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return NextResponse.json(alerts);
}
