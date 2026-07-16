import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await req.json() as { rows: Record<string, string>[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  // Pre-fetch default pipeline for stage mapping
  let defaultPipeline = await db.crmPipeline.findFirst({ where: { isDefault: true }, include: { stages: true } });
  if (!defaultPipeline) {
    defaultPipeline = await db.crmPipeline.findFirst({ include: { stages: true } });
  }

  const results: { row: number; status: "created" | "skipped" | "error"; title: string; reason?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const title = row.title?.trim();
    if (!title) {
      results.push({ row: i + 1, status: "skipped", title: row.title ?? "", reason: "Title is required" });
      continue;
    }

    const valueRaw = row.value?.replace(/[₦,\s]/g, "");
    const value = valueRaw ? parseFloat(valueRaw) : 0;
    const stageName = row.stage?.trim() || "Lead / Enquiry";
    const probability = row.probability ? parseInt(row.probability) : 10;

    // Optionally match to pipeline stage
    let pipelineId: string | null = null;
    let pipelineStageId: string | null = null;
    if (defaultPipeline) {
      pipelineId = defaultPipeline.id;
      const matchedStage = defaultPipeline.stages.find(
        (s) => s.name.toLowerCase() === stageName.toLowerCase()
      );
      if (matchedStage) {
        pipelineStageId = matchedStage.id;
      }
    }

    // Match contact by name if provided
    let contactId: string | null = null;
    const contactName = row.contactName?.trim() || row.contact_name?.trim();
    if (contactName) {
      const contact = await db.crmContact.findFirst({
        where: { name: { contains: contactName, mode: "insensitive" } },
      });
      if (contact) contactId = contact.id;
    }

    let expectedCloseDate: Date | null = null;
    if (row.expectedCloseDate || row.expected_close_date) {
      const raw = (row.expectedCloseDate || row.expected_close_date).trim();
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) expectedCloseDate = parsed;
    }

    try {
      await db.crmDeal.create({
        data: {
          title,
          contactName: contactName || "Unknown",
          contactId,
          value: isNaN(value) ? 0 : value,
          stage: stageName,
          probability: isNaN(probability) ? 10 : probability,
          pipelineId,
          pipelineStageId,
          expectedCloseDate,
          notes: row.notes?.trim() || null,
        },
      });
      results.push({ row: i + 1, status: "created", title });
    } catch (e) {
      results.push({ row: i + 1, status: "error", title, reason: e instanceof Error ? e.message : "DB error" });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const errors = results.filter((r) => r.status === "error" || r.status === "skipped").length;
  return NextResponse.json({ created, errors, results });
}
