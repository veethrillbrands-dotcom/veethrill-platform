import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, priority, actualCost, vendorId, notes, title, description } = body;

    const wo = await db.workOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(actualCost !== undefined && { actualCost }),
        ...(vendorId !== undefined && { vendorId }),
        ...(notes !== undefined && { notes }),
        ...(title && { title }),
        ...(description && { description }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    });
    return NextResponse.json(wo);
  } catch (error) {
    console.error("[MAINTENANCE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.workOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MAINTENANCE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
