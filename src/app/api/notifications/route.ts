import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [overduePayments, expiringLeases, urgentOrders, pendingInspections, pendingKYC] = await Promise.all([
    db.payment.findMany({
      where: { status: "OVERDUE" },
      include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    db.lease.findMany({
      where: { status: "ACTIVE", endDate: { lte: in30days, gte: now } },
      include: { tenant: { include: { user: true } }, unit: { include: { property: true } } },
      orderBy: { endDate: "asc" },
      take: 10,
    }),
    db.workOrder.findMany({
      where: { status: { in: ["OPEN", "ASSIGNED"] }, priority: { in: ["URGENT", "HIGH"] } },
      include: { property: true, unit: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.inspection.findMany({
      where: { completedAt: null, scheduledAt: { lte: now } },
      include: { property: true },
      take: 5,
    }),
    db.tenant.findMany({
      where: { kycStatus: "PENDING" },
      include: { user: true },
      take: 5,
    }),
  ]);

  type Notif = { icon: string; text: string; time: string; color: string; severity: "critical" | "warning" | "info" };
  const notifications: Notif[] = [];

  for (const p of overduePayments) {
    const days = Math.floor((now.getTime() - new Date(p.dueDate).getTime()) / 86400000);
    notifications.push({
      icon: "💰",
      text: `Overdue rent — ${p.tenant.user.firstName} ${p.tenant.user.lastName}${p.lease ? ` · ${p.lease.unit.property.name}` : ""} (${days}d overdue)`,
      time: `${days} day${days !== 1 ? "s" : ""} ago`,
      color: "bg-red-50",
      severity: "critical",
    });
  }

  for (const l of expiringLeases) {
    const days = Math.floor((new Date(l.endDate).getTime() - now.getTime()) / 86400000);
    const urgent = days <= 7;
    notifications.push({
      icon: "📄",
      text: `Lease expiring in ${days} day${days !== 1 ? "s" : ""} — ${l.tenant.user.firstName} ${l.tenant.user.lastName} · ${l.unit.property.name} Unit ${l.unit.unitNumber}`,
      time: `Expires ${new Date(l.endDate).toLocaleDateString()}`,
      color: urgent ? "bg-red-50" : "bg-yellow-50",
      severity: urgent ? "critical" : "warning",
    });
  }

  for (const w of urgentOrders) {
    notifications.push({
      icon: "🔧",
      text: `${w.priority} work order — ${w.title} · ${w.property.name}${w.unit ? ` Unit ${w.unit.unitNumber}` : ""}`,
      time: new Date(w.createdAt).toLocaleDateString(),
      color: w.priority === "URGENT" ? "bg-red-50" : "bg-orange-50",
      severity: w.priority === "URGENT" ? "critical" : "warning",
    });
  }

  for (const i of pendingInspections) {
    const days = Math.floor((now.getTime() - new Date(i.scheduledAt).getTime()) / 86400000);
    notifications.push({
      icon: "🔍",
      text: `Inspection overdue — ${i.property.name} (scheduled ${days}d ago)`,
      time: `${days} day${days !== 1 ? "s" : ""} ago`,
      color: "bg-yellow-50",
      severity: "warning",
    });
  }

  for (const t of pendingKYC) {
    notifications.push({
      icon: "👤",
      text: `KYC pending verification — ${t.user.firstName} ${t.user.lastName}`,
      time: new Date(t.createdAt).toLocaleDateString(),
      color: "bg-blue-50",
      severity: "info",
    });
  }

  // Sort: critical first, then warning, then info
  const order = { critical: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => order[a.severity] - order[b.severity]);

  return NextResponse.json(notifications);
}
