import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function csv(rows: string[][]): string {
  return rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

function dateStr(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB");
}

function currency(n: number | null | undefined) {
  return n != null ? n.toFixed(2) : "0.00";
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "payments";

  let rows: string[][] = [];
  let filename = type;

  if (type === "revenue") {
    const payments = await db.payment.findMany({
      include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    rows = [
      ["Date", "Tenant", "Property", "Unit", "Type", "Amount", "Status", "Reference"],
      ...payments.map((p) => [
        dateStr(p.paidAt ?? p.createdAt),
        `${p.tenant.user.firstName} ${p.tenant.user.lastName}`,
        p.lease?.unit.property.name ?? "",
        p.lease?.unit.unitNumber ?? "",
        p.type,
        currency(p.amount),
        p.status,
        p.reference ?? "",
      ]),
    ];
    filename = "revenue-report";
  } else if (type === "occupancy") {
    const properties = await db.property.findMany({ include: { units: true } });
    rows = [
      ["Property", "City", "State", "Total Units", "Occupied", "Vacant", "Occupancy %"],
      ...properties.map((p) => {
        const occupied = p.units.filter((u) => u.status === "OCCUPIED").length;
        const total = p.units.length;
        return [p.name, p.city, p.state, String(total), String(occupied), String(total - occupied), total > 0 ? `${Math.round((occupied / total) * 100)}%` : "0%"];
      }),
    ];
    filename = "occupancy-report";
  } else if (type === "leases") {
    const leases = await db.lease.findMany({
      include: { tenant: { include: { user: true } }, unit: { include: { property: true } } },
      orderBy: { endDate: "asc" },
    });
    rows = [
      ["Tenant", "Property", "Unit", "Start Date", "End Date", "Rent", "Status"],
      ...leases.map((l) => [
        `${l.tenant.user.firstName} ${l.tenant.user.lastName}`,
        l.unit.property.name,
        l.unit.unitNumber,
        dateStr(l.startDate),
        dateStr(l.endDate),
        currency(l.rentAmount),
        l.status,
      ]),
    ];
    filename = "lease-expiry-report";
  } else if (type === "work-orders") {
    const orders = await db.workOrder.findMany({
      include: { property: true, unit: true, vendor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    rows = [
      ["Title", "Property", "Unit", "Category", "Priority", "Status", "Estimated Cost", "Actual Cost", "Created"],
      ...orders.map((w) => [
        w.title,
        w.property.name,
        w.unit?.unitNumber ?? "—",
        w.category,
        w.priority,
        w.status,
        currency(w.estimatedCost),
        currency(w.actualCost),
        dateStr(w.createdAt),
      ]),
    ];
    filename = "work-orders-report";
  } else if (type === "tenants") {
    const tenants = await db.tenant.findMany({
      include: { user: true, leases: { include: { unit: { include: { property: true } } } } },
    });
    rows = [
      ["Name", "Email", "Phone", "KYC Status", "Property", "Unit", "Employer", "Notes"],
      ...tenants.map((t) => {
        const activeLease = t.leases[0];
        return [
          `${t.user.firstName} ${t.user.lastName}`,
          t.user.email ?? "",
          t.user.phone ?? "",
          t.kycStatus,
          activeLease?.unit.property.name ?? "",
          activeLease?.unit.unitNumber ?? "",
          t.employerName ?? "",
          t.notes ?? "",
        ];
      }),
    ];
    filename = "tenant-portfolio-report";
  } else if (type === "payments") {
    const payments = await db.payment.findMany({
      include: { tenant: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    rows = [
      ["Date", "Tenant", "Type", "Amount", "Status", "Due Date", "Reference"],
      ...payments.map((p) => [
        dateStr(p.paidAt ?? p.createdAt),
        `${p.tenant.user.firstName} ${p.tenant.user.lastName}`,
        p.type,
        currency(p.amount),
        p.status,
        dateStr(p.dueDate),
        p.reference ?? "",
      ]),
    ];
    filename = "rent-collection-report";
  } else if (type === "commissions") {
    const commissions = await db.crmCommission.findMany({ orderBy: { createdAt: "desc" } });
    rows = [
      ["Agent", "Property / Deal", "Deal Value", "Rate %", "Commission", "Type", "Status", "Sale Date", "Due Date", "Paid Date"],
      ...commissions.map((c) => [
        c.agent, c.property, currency(c.dealValue), String(c.commissionRate),
        currency(c.commissionAmount), c.type, c.status,
        dateStr(c.saleDate), dateStr(c.dueDate ?? null), dateStr(c.paidDate),
      ]),
    ];
    filename = "commissions-report";
  } else if (type === "invoices") {
    const invoices = await db.invoice.findMany({ orderBy: { createdAt: "desc" } });
    rows = [
      ["Invoice #", "Recipient", "Type", "Description", "Subtotal", "Tax", "Total", "Status", "Due Date", "Issued"],
      ...invoices.map((inv) => [
        inv.invoiceNumber, inv.recipientName, inv.type, inv.description,
        currency(inv.subtotal), String(inv.taxRate) + "%", currency(inv.total),
        inv.status, dateStr(inv.dueDate), dateStr(inv.issuedAt),
      ]),
    ];
    filename = "invoices-report";
  }

  const csvContent = csv(rows);
  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
