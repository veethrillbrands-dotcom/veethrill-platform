import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = await db.crmPipeline.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      deals: {
        include: { contact: { select: { id: true, name: true } }, pipelineStage: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pipeline);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const pipeline = await db.crmPipeline.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
    },
    include: { stages: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(pipeline);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Don't delete default pipeline if it's the only one
  const count = await db.crmPipeline.count();
  if (count <= 1) return NextResponse.json({ error: "Cannot delete the last pipeline" }, { status: 400 });
  await db.crmPipeline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
