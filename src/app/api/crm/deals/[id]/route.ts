import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { dueDate, value, probability, pipelineStageId, ...rest } = body;

    // Sync stage name from pipeline stage
    let stageName: string | undefined;
    let stageProbability: number | undefined;
    if (pipelineStageId !== undefined) {
      if (pipelineStageId) {
        const ps = await db.crmPipelineStage.findUnique({ where: { id: pipelineStageId } });
        if (ps) { stageName = ps.name; stageProbability = ps.probability; }
      }
    }

    const deal = await db.crmDeal.update({
      where: { id },
      data: {
        ...rest,
        ...(value !== undefined && { value: Number(value) }),
        ...(probability !== undefined && { probability: Number(probability) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(pipelineStageId !== undefined && { pipelineStageId: pipelineStageId || null }),
        ...(stageName !== undefined && { stage: stageName }),
        ...(stageProbability !== undefined && { probability: stageProbability }),
      },
      include: { contact: { select: { id: true, name: true } }, pipelineStage: true },
    });
    return NextResponse.json(deal);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.crmDeal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
