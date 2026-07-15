import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { type, scheduledAt, completedAt, inspectorId, findings, damageReport, rating } = body;

    const data: Record<string, unknown> = {};
    if (type) data.type = type;
    if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
    if (completedAt !== undefined) data.completedAt = completedAt ? new Date(completedAt) : null;
    if (inspectorId !== undefined) data.inspectorId = inspectorId || null;
    if (findings !== undefined) data.findings = findings;
    if (damageReport !== undefined) data.damageReport = damageReport;
    if (rating !== undefined) data.rating = rating ? Number(rating) : null;

    const inspection = await db.inspection.update({
      where: { id }, data,
      include: { property: true, unit: true },
    });
    return NextResponse.json(inspection);
  } catch (error) {
    console.error("[INSPECTION_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.inspection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[INSPECTION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
