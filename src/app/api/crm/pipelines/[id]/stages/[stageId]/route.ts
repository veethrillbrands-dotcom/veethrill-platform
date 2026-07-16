import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; stageId: string }> }) {
  const { stageId } = await params;
  const body = await req.json();
  const stage = await db.crmPipelineStage.update({
    where: { id: stageId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.probability !== undefined && { probability: Number(body.probability) }),
      ...(body.order !== undefined && { order: Number(body.order) }),
      ...(body.isWon !== undefined && { isWon: body.isWon }),
      ...(body.isLost !== undefined && { isLost: body.isLost }),
    },
  });
  return NextResponse.json(stage);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; stageId: string }> }) {
  const { id: pipelineId, stageId } = await params;
  const count = await db.crmPipelineStage.count({ where: { pipelineId } });
  if (count <= 1) return NextResponse.json({ error: "Cannot delete the last stage" }, { status: 400 });
  await db.crmPipelineStage.delete({ where: { id: stageId } });
  return NextResponse.json({ ok: true });
}
