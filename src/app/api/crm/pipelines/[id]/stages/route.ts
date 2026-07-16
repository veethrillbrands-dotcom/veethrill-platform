import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: pipelineId } = await params;
  const body = await req.json();
  const { name, color, probability, isWon, isLost } = body;

  const maxOrder = await db.crmPipelineStage.aggregate({
    where: { pipelineId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const stage = await db.crmPipelineStage.create({
    data: {
      pipelineId,
      name,
      color: color ?? "#6B7280",
      probability: probability ?? 30,
      isWon: isWon ?? false,
      isLost: isLost ?? false,
      order,
    },
  });
  return NextResponse.json(stage, { status: 201 });
}
