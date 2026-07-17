import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pipelineId = searchParams.get("pipelineId");

  const deals = await db.crmDeal.findMany({
    where: pipelineId ? { pipelineId } : {},
    include: {
      contact: { select: { id: true, name: true } },
      pipelineStage: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { title, contactId, contactName, value, stage, probability, dueDate, notes, productType, pipelineId, pipelineStageId } = body;
    if (!title || !contactName) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

    // If pipeline stage given, sync the stage name
    let stageName = stage || "Enquiry";
    let stageProbability = Number(probability) || 30;
    if (pipelineStageId) {
      const ps = await db.crmPipelineStage.findUnique({ where: { id: pipelineStageId } });
      if (ps) { stageName = ps.name; stageProbability = ps.probability; }
    }

    const deal = await db.crmDeal.create({
      data: {
        title,
        contactId: contactId || undefined,
        contactName,
        value: Number(value) || 0,
        stage: stageName,
        probability: stageProbability,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
        productType: productType || undefined,
        pipelineId: pipelineId || null,
        pipelineStageId: pipelineStageId || null,
      },
      include: { contact: { select: { id: true, name: true } }, pipelineStage: true },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
