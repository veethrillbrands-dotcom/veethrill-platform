import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.type !== undefined) data.type = body.type;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.dueAt !== undefined) data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (body.contactId !== undefined) data.contactId = body.contactId || null;
  if (body.dealId !== undefined) data.dealId = body.dealId || null;
  if (body.propertyId !== undefined) data.propertyId = body.propertyId || null;
  if (body.assignedToName !== undefined) data.assignedToName = body.assignedToName;

  if (body.status !== undefined) {
    data.status = body.status;
    data.completedAt = body.status === "COMPLETED" ? new Date() : null;
  }

  const task = await db.crmTask.update({
    where: { id },
    data,
    include: {
      contact: { select: { id: true, name: true, type: true } },
      deal: { select: { id: true, title: true, stage: true } },
      property: { select: { id: true, name: true, city: true } },
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.crmTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
