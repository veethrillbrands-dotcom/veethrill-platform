import { db } from "@/lib/db";

/**
 * Builds a rich business context snapshot from the live database.
 * This is injected into every AI prompt so Claude can give accurate,
 * data-grounded answers instead of generic responses.
 */
export async function buildBusinessContext(): Promise<string> {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const [
      properties,
      overduePayments,
      leases,
      workOrders,
      inspections,
      contacts,
      deals,
      tasks,
      meetings,
      invoices,
    ] = await Promise.all([
      db.property.findMany({
        include: { units: { include: { leases: { where: { status: "ACTIVE" } } } } },
      }),
      db.payment.findMany({
        where: { status: "OVERDUE" },
        include: { tenant: { include: { user: true } }, lease: { include: { unit: { include: { property: true } } } } },
        orderBy: { dueDate: "asc" },
      }),
      db.lease.findMany({
        where: { status: "ACTIVE", endDate: { lte: in60 } },
        include: { tenant: { include: { user: true } }, unit: { include: { property: true } } },
        orderBy: { endDate: "asc" },
      }),
      db.workOrder.findMany({
        where: { status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } },
        include: { property: true, unit: true },
        orderBy: [{ priority: "asc" }, { raisedAt: "asc" }],
        take: 10,
      }),
      db.inspection.findMany({
        where: { completedAt: null, scheduledAt: { lte: now } },
        include: { property: true },
        take: 5,
      }),
      db.crmContact.findMany({
        include: { deals: { where: { stage: { notIn: ["Closed Won", "Closed Lost"] } } } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      db.crmDeal.findMany({
        where: { stage: { notIn: ["Closed Won", "Closed Lost"] } },
        include: { contact: true },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      db.crmTask.findMany({
        where: { status: { not: "COMPLETED" }, dueAt: { not: null } },
        include: { contact: true },
        orderBy: { dueAt: "asc" },
        take: 10,
      }),
      db.crmMeeting.findMany({
        where: { status: "SCHEDULED", scheduledAt: { gte: now } },
        include: { contact: true, deal: true, property: true },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      db.invoice.findMany({
        where: { status: { in: ["SENT", "PENDING_APPROVAL", "APPROVED"] }, dueDate: { lte: now } },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
    ]);

    // Property metrics
    const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
    const occupiedUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.status === "OCCUPIED").length, 0);
    const vacantUnits = properties.reduce((s, p) => s + p.units.filter((u) => u.status === "VACANT").length, 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const monthlyRevenuePotential = properties.reduce((s, p) =>
      s + p.units.filter((u) => u.status === "OCCUPIED").reduce((us, u) => us + u.monthlyRent, 0), 0);

    // Overdue rent
    const overdueAmount = overduePayments.reduce((s, p) => s + p.amount, 0);
    const overdueTenantsStr = overduePayments.slice(0, 5).map((p) =>
      `  - ${p.tenant.user.firstName} ${p.tenant.user.lastName} — ₦${p.amount.toLocaleString()} overdue since ${p.dueDate.toLocaleDateString("en-GB")} (${p.lease?.unit?.property?.name ?? "unknown property"})`
    ).join("\n");

    // Lease renewals
    const expiring30 = leases.filter((l) => l.endDate <= in30);
    const expiring60 = leases.filter((l) => l.endDate > in30 && l.endDate <= in60);
    const expiringStr = leases.slice(0, 5).map((l) =>
      `  - ${l.tenant.user.firstName} ${l.tenant.user.lastName} — ${l.unit.property.name} Unit ${l.unit.unitNumber} — expires ${l.endDate.toLocaleDateString("en-GB")} — ₦${l.rentAmount.toLocaleString()}/month`
    ).join("\n");

    // Work orders
    const urgentWOs = workOrders.filter((w) => ["URGENT", "HIGH"].includes(w.priority)).length;
    const wosStr = workOrders.slice(0, 5).map((w) =>
      `  - [${w.priority}] ${w.title} — ${w.property.name}${w.unit ? ` Unit ${w.unit.unitNumber}` : ""} — ${w.status}`
    ).join("\n");

    // Active deals
    const dealsStr = deals.slice(0, 8).map((d) =>
      `  - "${d.title}" — Contact: ${d.contactName} — Stage: ${d.stage} — Value: ₦${d.value.toLocaleString()}`
    ).join("\n");

    // Overdue tasks
    const overdueTasks = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < now);
    const tasksStr = tasks.slice(0, 5).map((t) => {
      const due = t.dueAt ? new Date(t.dueAt) : null;
      const isOverdue = due && due < now;
      return `  - [${t.priority}${isOverdue ? " OVERDUE" : ""}] ${t.title}${t.contact ? ` — re: ${t.contact.name}` : ""} — due ${due?.toLocaleDateString("en-GB") ?? "no date"}`;
    }).join("\n");

    // Upcoming meetings
    const meetingsStr = meetings.slice(0, 5).map((m) =>
      `  - "${m.title}" — ${new Date(m.scheduledAt).toLocaleDateString("en-GB")} ${new Date(m.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} — ${m.type} — ${m.contact?.name ?? "no contact"}`
    ).join("\n");

    // Overdue invoices
    const overdueInvAmt = invoices.reduce((s, i) => s + i.total, 0);
    const invoicesStr = invoices.slice(0, 5).map((i) =>
      `  - Invoice ${i.invoiceNumber} — ${i.recipientName} — ₦${i.total.toLocaleString()} — due ${i.dueDate.toLocaleDateString("en-GB")}`
    ).join("\n");

    return `You are Veethrill AI, an intelligent assistant built into Veethrill Realty's property management platform. You have access to live business data and must give specific, accurate, actionable advice based on this data.

Today's date: ${now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}

═══════════════════════════════════
PORTFOLIO OVERVIEW
═══════════════════════════════════
• Properties: ${properties.length}
• Total units: ${totalUnits}
• Occupied: ${occupiedUnits} (${occupancyRate}% occupancy)
• Vacant: ${vacantUnits} units
• Monthly revenue potential (occupied units): ₦${monthlyRevenuePotential.toLocaleString()}

═══════════════════════════════════
OVERDUE RENT (${overduePayments.length} tenants, ₦${overdueAmount.toLocaleString()} total)
═══════════════════════════════════
${overdueTenantsStr || "  None currently overdue."}

═══════════════════════════════════
LEASE RENEWALS REQUIRED (next 60 days)
═══════════════════════════════════
• Expiring within 30 days: ${expiring30.length}
• Expiring within 31–60 days: ${expiring60.length}
${expiringStr || "  No leases expiring in this window."}

═══════════════════════════════════
OPEN MAINTENANCE (${workOrders.length} open, ${urgentWOs} urgent/high)
═══════════════════════════════════
${wosStr || "  No open work orders."}

═══════════════════════════════════
OVERDUE INSPECTIONS (${inspections.length} pending)
═══════════════════════════════════
${inspections.map((i) => `  - ${i.type} — ${i.property.name} — was due ${new Date(i.scheduledAt).toLocaleDateString("en-GB")}`).join("\n") || "  None overdue."}

═══════════════════════════════════
CRM — ACTIVE DEALS (${deals.length} in pipeline)
═══════════════════════════════════
${dealsStr || "  No active deals."}

═══════════════════════════════════
CRM — TASKS & REMINDERS (${overdueTasks.length} overdue)
═══════════════════════════════════
${tasksStr || "  No pending tasks."}

═══════════════════════════════════
UPCOMING MEETINGS (${meetings.length})
═══════════════════════════════════
${meetingsStr || "  No upcoming meetings."}

═══════════════════════════════════
OVERDUE INVOICES (${invoices.length}, ₦${overdueInvAmt.toLocaleString()} outstanding)
═══════════════════════════════════
${invoicesStr || "  None overdue."}

═══════════════════════════════════
BEHAVIOURAL GUIDELINES
═══════════════════════════════════
- Be specific. Reference actual names, properties, amounts, and dates from the data above.
- Be concise. Use bullet points and headers for structured answers.
- Be actionable. Every response should end with 2–3 clear recommended next steps.
- Nigerian context: use ₦ for naira, reference Nigerian business norms where relevant.
- When suggesting messages, write them ready to send (WhatsApp-friendly, professional but warm).
- When suggesting tasks, be specific about who should do it and when.
- When asked to generate messages/agendas, format them cleanly for immediate use.
`;
  } catch (err) {
    console.error("AI context build failed:", err);
    return `You are Veethrill AI, an intelligent assistant for a Nigerian real estate company called Veethrill Realty Brands. The live database is temporarily unavailable. Answer based on general Nigerian real estate management best practices. Today: ${new Date().toLocaleDateString("en-GB")}.`;
  }
}
