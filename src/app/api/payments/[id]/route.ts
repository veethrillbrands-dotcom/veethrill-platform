import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, method, paidAt, notes } = body;

    const payment = await db.payment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(method && { method }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
        ...(notes !== undefined && { notes }),
        ...(status === "PAID" && !paidAt && { paidAt: new Date() }),
      },
    });
    return NextResponse.json(payment);
  } catch (error) {
    console.error("[PAYMENT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
