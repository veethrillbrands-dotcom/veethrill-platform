import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, paidDate } = body;
    const commission = await db.crmCommission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(status === "Paid" && { paidDate: paidDate ? new Date(paidDate) : new Date() }),
      },
    });
    return NextResponse.json(commission);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.crmCommission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
