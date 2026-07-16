import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { buildBusinessContext } from "@/lib/ai-context";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(system: string, prompt: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 600,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ suggestions: [], error: "AI not configured" });
  }

  const { type, entityId, context } = await req.json();
  const systemBase = await buildBusinessContext();

  try {
    if (type === "contact") {
      const contact = await db.crmContact.findUnique({
        where: { id: entityId },
        include: {
          deals: { orderBy: { updatedAt: "desc" }, take: 3 },
          activities: { orderBy: { activityAt: "desc" }, take: 5 },
          tasks: { where: { status: { not: "COMPLETED" } }, orderBy: { dueAt: "asc" }, take: 3 },
          meetings: { where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } }, take: 2 },
        },
      });
      if (!contact) return NextResponse.json({ suggestions: [] });

      const contactCtx = `
Contact: ${contact.name} (${contact.type})
Email: ${contact.email ?? "none"} | Phone: ${contact.phone ?? "none"}
Company: ${contact.company ?? "none"} | Location: ${contact.location ?? "none"}
Source: ${contact.source ?? "unknown"}
Last activity: ${contact.activities[0] ? `${contact.activities[0].type} on ${new Date(contact.activities[0].activityAt).toLocaleDateString("en-GB")} — ${contact.activities[0].body.slice(0, 100)}` : "No activities yet"}
Active deals: ${contact.deals.length === 0 ? "None" : contact.deals.map((d) => `${d.title} (${d.stage}, ₦${d.value.toLocaleString()})`).join("; ")}
Open tasks: ${contact.tasks.length === 0 ? "None" : contact.tasks.map((t) => `${t.title} due ${t.dueAt ? new Date(t.dueAt).toLocaleDateString("en-GB") : "no date"}`).join("; ")}
Upcoming meetings: ${contact.meetings.length === 0 ? "None" : contact.meetings.map((m) => `${m.title} on ${new Date(m.scheduledAt).toLocaleDateString("en-GB")}`).join("; ")}
`;

      const text = await callGroq(systemBase,
        `Based on this contact's profile and interaction history, suggest 4 specific next steps the Veethrill team should take. Format as a JSON array of objects with keys: "title" (short action, max 8 words), "description" (1 sentence why), "type" (one of: CALL, EMAIL, FOLLOW_UP, MEETING, TASK, SITE_VISIT), "priority" (HIGH/MEDIUM/LOW). Return ONLY valid JSON array.\n\n${contactCtx}`
      );
      const match = text.match(/\[[\s\S]*\]/);
      const suggestions = match ? JSON.parse(match[0]) : [];
      return NextResponse.json({ suggestions });
    }

    if (type === "deal") {
      const deal = await db.crmDeal.findUnique({
        where: { id: entityId },
        include: {
          contact: { include: { activities: { take: 3, orderBy: { activityAt: "desc" } } } },
          pipelineStage: true,
          tasks: { where: { status: { not: "COMPLETED" } }, take: 3 },
          meetings: { where: { status: "SCHEDULED" }, take: 2 },
        },
      });
      if (!deal) return NextResponse.json({ suggestions: [] });

      const dealCtx = `
Deal: "${deal.title}"
Contact: ${deal.contactName}
Value: ₦${deal.value.toLocaleString()}
Current stage: ${deal.pipelineStage?.name ?? deal.stage}
Stage probability: ${deal.pipelineStage?.probability ?? deal.probability}%
Expected close: ${deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString("en-GB") : "not set"}
Notes: ${deal.notes ?? "none"}
Open tasks: ${deal.tasks.length}
Upcoming meetings: ${deal.meetings.length}
Last interaction: ${deal.contact?.activities[0] ? `${deal.contact.activities[0].type} on ${new Date(deal.contact.activities[0].activityAt).toLocaleDateString("en-GB")}` : "No recorded activities"}
`;

      const text = await callGroq(systemBase,
        `Based on this deal's current stage and history, suggest 4 specific actions to progress it towards closing. Format as JSON array with keys: "title", "description", "type" (CALL/EMAIL/MEETING/FOLLOW_UP/SITE_VISIT/TASK), "priority". Return ONLY valid JSON array.\n\n${dealCtx}`
      );
      const match = text.match(/\[[\s\S]*\]/);
      const suggestions = match ? JSON.parse(match[0]) : [];
      return NextResponse.json({ suggestions });
    }

    if (type === "tenant") {
      const tenant = await db.tenant.findUnique({
        where: { id: entityId },
        include: {
          user: true,
          leases: { include: { unit: { include: { property: true } } }, orderBy: { startDate: "desc" }, take: 1 },
          payments: { where: { status: "OVERDUE" }, take: 5 },
        },
      });
      if (!tenant) return NextResponse.json({ suggestions: [] });

      const activeLease = tenant.leases[0];
      const daysToExpiry = activeLease ? Math.round((new Date(activeLease.endDate).getTime() - Date.now()) / 86400000) : null;
      const tenantCtx = `
Tenant: ${tenant.user.firstName} ${tenant.user.lastName}
Email: ${tenant.user.email} | Phone: ${tenant.user.phone ?? "none"}
KYC Status: ${tenant.kycStatus}
Active lease: ${activeLease ? `${activeLease.unit.property.name} Unit ${activeLease.unit.unitNumber} — ₦${activeLease.rentAmount.toLocaleString()}/month — expires ${new Date(activeLease.endDate).toLocaleDateString("en-GB")} (${daysToExpiry !== null ? `${daysToExpiry} days` : "expired"})` : "No active lease"}
Overdue payments: ${tenant.payments.length} (total ₦${tenant.payments.reduce((s, p) => s + p.amount, 0).toLocaleString()})
`;

      const text = await callGroq(systemBase,
        `Based on this tenant profile, suggest 4 specific next steps for the Veethrill team. Format as JSON array with keys: "title", "description", "type" (CALL/EMAIL/MEETING/FOLLOW_UP/TASK), "priority". Return ONLY valid JSON array.\n\n${tenantCtx}`
      );
      const match = text.match(/\[[\s\S]*\]/);
      const suggestions = match ? JSON.parse(match[0]) : [];
      return NextResponse.json({ suggestions });
    }

    if (type === "message_template") {
      const { recipient, purpose, additionalContext } = context ?? {};
      const text = await callGroq(systemBase,
        `Generate 3 ready-to-send message templates for ${purpose} to ${recipient}. ${additionalContext ?? ""}
Return as JSON array of objects with keys: "channel" (WHATSAPP/EMAIL/SMS), "subject" (email only), "body" (the message text, warm but professional Nigerian business tone, use first name only). Return ONLY valid JSON array.`
      );
      const match = text.match(/\[[\s\S]*\]/);
      const templates = match ? JSON.parse(match[0]) : [];
      return NextResponse.json({ templates });
    }

    if (type === "meeting_agenda") {
      const { meetingTitle, attendees, linkedContact, linkedDeal, linkedProperty, duration } = context ?? {};
      const text = await callGroq(systemBase,
        `Generate a concise meeting agenda for: "${meetingTitle}"
Duration: ${duration ?? 60} minutes
Attendees: ${Array.isArray(attendees) ? attendees.map((a: { name: string; role?: string }) => `${a.name}${a.role ? ` (${a.role})` : ""}`).join(", ") : attendees ?? "not specified"}
${linkedContact ? `Contact context: ${linkedContact}` : ""}
${linkedDeal ? `Deal context: ${linkedDeal}` : ""}
${linkedProperty ? `Property context: ${linkedProperty}` : ""}

Return as JSON with keys: "openingPoints" (array of strings, max 3), "mainAgendaItems" (array of {item, duration_minutes, owner}), "closingPoints" (array of strings), "preReadings" (array of strings, optional). Return ONLY valid JSON.`
      );
      const match = text.match(/\{[\s\S]*\}/);
      const agenda = match ? JSON.parse(match[0]) : null;
      return NextResponse.json({ agenda });
    }

    if (type === "dashboard_insights") {
      const text = await callGroq(systemBase,
        `Based on the current business data, identify the top 5 most important actions the Veethrill leadership team should take TODAY. Format as JSON array of objects with: "priority" (1-5, 1=most urgent), "category" (RENT/LEASE/MAINTENANCE/CRM/FINANCE), "headline" (max 10 words), "detail" (1-2 sentences), "action" (specific next step). Sort by priority. Return ONLY valid JSON array.`
      );
      const match = text.match(/\[[\s\S]*\]/);
      const insights = match ? JSON.parse(match[0]) : [];
      return NextResponse.json({ insights });
    }

    return NextResponse.json({ error: "Unknown suggestion type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("AI suggest error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg, suggestions: [] }, { status: 500 });
  }
}
